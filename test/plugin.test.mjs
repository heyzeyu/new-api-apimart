import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as plugin from '../plugin.js';

const fixture = JSON.parse(readFileSync(new URL('./contract-fixture.json', import.meta.url), 'utf8'));
for (const entry of fixture.cases) {
  test(entry.name, () => {
    let hook = plugin[entry.hook];
    for (const member of entry.path || []) hook = hook[member];
    if (entry.expectedError) {
      assert.throws(() => hook(...entry.args), error => error.message.includes(entry.expectedError));
    } else {
      // The host also normalizes results through its JSON codec.
      assert.deepEqual(JSON.parse(JSON.stringify(hook(...entry.args))), entry.expected);
    }
  });
}

test('declared models have isolated image/video bindings and valid submit requests', () => {
  const images = plugin.meta.protocols.find(claim => claim.name === 'openai_image').models;
  const videos = plugin.meta.protocols.find(claim => claim.name === 'openai_video').models;
  assert.deepEqual([...images, ...videos].sort(), [...plugin.meta.models].sort());
  assert.equal(new Set(plugin.meta.models).size, plugin.meta.models.length);
  for (const model of plugin.meta.models) {
    const protocol = videos.includes(model) ? 'openai_video' : 'openai_image';
    const intent = plugin.protocols[protocol].decodeRequest({model, body:{kind:'json',value:{prompt:'A red circle'}}});
    const request = plugin.buildSubmitRequest({...intent,upstreamModel:model,baseUrl:'https://api.apimart.ai',apiKey:'fixture-only'});
    assert.equal(request.body.model,model);
    assert.equal(request.method,'POST');
    assert.equal(request.url, 'https://api.apimart.ai/v1/'+(protocol==='openai_video'?'videos':'images')+'/generations');
  }
});
