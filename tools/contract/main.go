// SPDX-License-Identifier: AGPL-3.0-only
// Run inside a new-api checkout to verify the real host runtime.
package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"github.com/QuantumNous/new-api/pkg/jsplugin"
	"github.com/QuantumNous/new-api/plugins"
)

func main() {
	sourcePath := flag.String("plugin", "plugin.js", "Plugin source")
	fixturePath := flag.String("fixture", "test/contract-fixture.json", "Portable fixture")
	flag.Parse()
	if err := verify(*sourcePath, *fixturePath); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func verify(sourcePath, fixturePath string) error {
	source, err := os.ReadFile(sourcePath)
	if err != nil {
		return err
	}
	registry := jsplugin.NewRegistry()
	for _, builtin := range jsplugin.DefaultRegistry.Generation().Plugins() {
		code, err := plugins.Source(builtin.Meta.Key)
		if err != nil {
			return err
		}
		if _, err := registry.RegisterFactory(code, jsplugin.Options{}); err != nil {
			return err
		}
	}
	loaded, err := registry.Register(string(source), jsplugin.Options{})
	if err != nil {
		return fmt.Errorf("compile APIMart with built-ins: %w", err)
	}
	if loaded.Meta.Key != "apimart" || len(loaded.Meta.ChannelTypes) != 0 {
		return fmt.Errorf("APIMart must use a dedicated task-plugin channel")
	}
	for _, model := range loaded.Meta.Models {
		binding, found := registry.Generation().LookupEndpoint("POST", "/v1/responses", model)
		if !found || binding.Plugin.Meta.Key != "apimart" {
			return fmt.Errorf("missing Responses binding for %s", model)
		}
	}
	for _, path := range []string{"/apimart/v1/images/generations", "/apimart/v1/videos/generations"} {
		route, found := registry.Generation().LookupDeclaredRoute("POST", path)
		if !found || route.Plugin.Meta.Key != "apimart" {
			return fmt.Errorf("missing native route %s", path)
		}
	}
	for _, imageModel := range []string{"gpt-image-2", "gpt-image-2-ext", "gpt-image-2-official", "gpt-image-2.5-flare", "gpt-image-2.5-sunburst", "gpt-image-2.5-ext"} {
		for _, path := range []string{"/v1/images/generations", "/v1/images/edits", "/v1/responses"} {
			matched := false
			for _, candidate := range registry.Generation().LookupEndpointCandidates("POST", path, imageModel) {
				matched = matched || candidate.Plugin.Meta.Key == "apimart"
			}
			if !matched {
				return fmt.Errorf("missing APIMart image binding for %s on %s", imageModel, path)
			}
		}
		schema, _ := loaded.Meta.UsageForModel(imageModel)
		if _, found := schema["image_count"]; !found {
			return fmt.Errorf("missing image usage profile for %s", imageModel)
		}
		if _, found := schema["seconds"]; found {
			return fmt.Errorf("video usage leaked into image profile %s", imageModel)
		}
	}
	// The shared plugin serves explicit provider models. Fixed-price automatic
	// routes retain their own selection and billing lifecycle.
	for _, imageModel := range []string{"gpt-image", "gpt-image-2-2k-medium"} {
		if declared, found := registry.Generation().CanonicalModel(imageModel); found {
			if plugin, ok := registry.Generation().GetByModel(declared); ok && plugin.Meta.Key == "apimart" {
				return fmt.Errorf("APIMart must not own image identity %s", imageModel)
			}
		}
		for _, path := range []string{"/v1/images/generations", "/v1/images/edits", "/v1/responses"} {
			for _, candidate := range registry.Generation().LookupEndpointCandidates("POST", path, imageModel) {
				if candidate.Plugin.Meta.Key == "apimart" {
					return fmt.Errorf("APIMart intercepted image model %s on %s", imageModel, path)
				}
			}
		}
	}
	route, found := registry.Generation().LookupDeclaredRoute("POST", "/kling/v1/videos/text2video")
	if !found || route.Plugin.Meta.Key != "kling" {
		return fmt.Errorf("built-in Kling ownership changed")
	}
	fixture, err := os.ReadFile(fixturePath)
	if err != nil {
		return err
	}
	report, err := jsplugin.ReplayFixture(context.Background(), string(source), fixture)
	if err != nil {
		return fmt.Errorf("fixture %d/%d: %w", report.Passed, report.Total, err)
	}
	fmt.Printf("new-api runtime: %s@%s, %d models, %d/%d fixture cases passed\n", loaded.Meta.Key, loaded.Meta.Version, len(loaded.Meta.Models), report.Passed, report.Total)
	return nil
}
