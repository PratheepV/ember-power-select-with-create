import { Promise as EmberPromise } from 'rsvp';
import ArrayProxy from '@ember/array/proxy';
import { run } from '@ember/runloop';
import { A } from '@ember/array';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { typeInSearch, clickTrigger } from '../../helpers/ember-power-select';
import { find, findAll, click } from 'ember-native-dom-helpers';

moduleForComponent('power-select-with-create', 'Integration | Component | power select with create', {
  integration: true,

  beforeEach: function() {
    this.set('countries', A([
      { name: 'United States',  code: 'US', population: 321853000 },
      { name: 'Spain',          code: 'ES', population: 46439864 },
      { name: 'Portugal',       code: 'PT', population: 10374822 },
      { name: 'Russia',         code: 'RU', population: 146588880 },
      { name: 'Latvia',         code: 'LV', population: 1978300 },
      { name: 'Brazil',         code: 'BR', population: 204921000 },
      { name: 'United Kingdom', code: 'GB', population: 64596752 },
    ]));
    this.on('createCountry', (countryName) => {
      let newCountry = {name: countryName, code: 'XX', population: 'unknown'};
      this.get('countries').pushObject(newCountry);
    });
  },
});

test('it displays option to add item with default text', function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        oncreate=(action "createCountry")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  run(() => typeInSearch('Foo Bar'));

  assert.equal(
    find('.ember-power-select-option').textContent.trim(),
    'Add "Foo Bar"...'
  );
});

test('it displays option to add item with default text at bottom', function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        oncreate=(action "createCountry")
        showCreatePosition="bottom"
        searchField="name"
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  run(() => typeInSearch('Russ'));

  const options = findAll('.ember-power-select-option');
  assert.equal(
    options[1].textContent.trim(),
    'Add "Russ"...'
  );
});

test('it displays option to add item with custom text', function(assert) {
  assert.expect(1);

  this.on('customSuggestion', (term) => {
    return `Create ${term}`;
  });

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        oncreate=(action "createCountry")
        buildSuggestion=(action "customSuggestion")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  run(() => typeInSearch('Foo Bar'));

  assert.equal(
    find('.ember-power-select-option').textContent.trim(),
    'Create Foo Bar'
  );
});


test('it displays option to add item with custom text at bottom', function(assert) {
  assert.expect(1);

  this.on('customSuggestion', (term) => {
    return `Create ${term}`;
  });

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        oncreate=(action "createCountry")
        buildSuggestion=(action "customSuggestion")
        searchField='name'
        showCreatePosition="bottom"
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  run(() => typeInSearch('Russ'));

  const options = findAll('.ember-power-select-option');
  assert.equal(
    options[1].textContent.trim(),
    'Create Russ'
  );
});

test('it executes the oncreate callback', function(assert) {
  assert.expect(1);

  this.on('createCountry', (countryName) => {
    assert.equal(countryName, 'Foo Bar');
  });

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        oncreate=(action "createCountry")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  run(() => typeInSearch('Foo Bar'));
  click(findAll('.ember-power-select-option')[0]);
});

test('it lets the user specify a custom search action', function(assert) {
  assert.expect(5);

  this.on('customSearch', function(term) {
    assert.equal(term, 'Foo Bar');
    return [
      {name: 'Foo'},
      {name: 'Bar'},
    ];
  });

  this.render(hbs`
    {{#power-select-with-create
        search=(action "customSearch")
        oncreate=(action "createCountry")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  run(() => typeInSearch('Foo Bar'));

  const options = findAll('.ember-power-select-option');
  assert.equal(options.length, 3);
  assert.equal(options[0].textContent.trim(), 'Add "Foo Bar"...');
  assert.equal(options[1].textContent.trim(), 'Foo');
  assert.equal(options[2].textContent.trim(), 'Bar');
});

test('async search works with an ArrayProxy', function(assert) {
  assert.expect(5);

  this.on('customSearch', function(term) {
    assert.equal(term, 'Foo Bar');
    return ArrayProxy.create({
      content: A([
        {name: 'Foo'},
        {name: 'Bar'},
      ])
    });
  });

  this.render(hbs`
    {{#power-select-with-create
        search=(action "customSearch")
        oncreate=(action "createCountry")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  run(() => typeInSearch('Foo Bar'));

  const options = findAll('.ember-power-select-option');
  assert.equal(options.length, 3);
  assert.equal(options[0].textContent.trim(), 'Add "Foo Bar"...');
  assert.equal(options[1].textContent.trim(), 'Foo');
  assert.equal(options[2].textContent.trim(), 'Bar');
});

test('it lets the user decide if the create option should be shown', function(assert) {
  assert.expect(5);

  this.set('countries', [{name: 'Canada'}]);
  this.set('show', false);
  this.on('shouldShowCreate', (term) => {
    assert.equal(term, 'can');
    return this.get('show');
  });

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        searchField="name"
        oncreate=(action "createCountry")
        showCreateWhen=(action "shouldShowCreate")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  typeInSearch('can');
  assert.equal(findAll('.ember-power-select-option').length, 1);
  assert.equal(find('.ember-power-select-option').textContent.trim(), 'Canada');

  this.set('show', true);

  typeInSearch('can');
  assert.equal(findAll('.ember-power-select-option').length, 2);
});

test('shouldShowCreate called with options when backed by static array', function(assert) {
  assert.expect(1);

  const countries = [{name: 'Canada'}];
  this.set('countries', countries);
  this.on('shouldShowCreate', (term, options) => {
    assert.deepEqual(options, countries);
    return true;
  });

  this.render(hbs`
    {{#power-select-with-create
        options=countries
        searchField="name"
        oncreate=(action "createCountry")
        showCreateWhen=(action "shouldShowCreate")
        renderInPlace=true as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  typeInSearch('can');
});

test('shouldShowCreate called with options when backed by async search', function(assert) {
  assert.expect(1);

  const countries = [{name: 'Canada'}];
  this.on('searchCountries', () => {
    return new EmberPromise((resolve) => {
      resolve(countries);
    });
  });

  this.on('shouldShowCreate', (term, options) => {
    assert.deepEqual(options, countries);
    return true;
  });

  this.render(hbs`
    {{#power-select-with-create
        search=(action "searchCountries")
        onchange=(action (mut selectedCountries))
        oncreate=(action "createCountry")
        showCreateWhen=(action "shouldShowCreate")
        renderInPlace=true
         as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  typeInSearch('can');
});

test('shouldShowCreate works with async search', function(assert) {
  assert.expect(5);

  this.set('selectedCountries', []);
  this.set('show', true);
  this.on('searchCountries', () => {
    return new EmberPromise((resolve) => {
      resolve([{name: 'Foo'}, {name: 'Bar'}]);
    });
  });

  this.on('shouldShowCreate', (term) => {
    assert.equal(term, 'can');
    return this.get('show');
  });

  this.render(hbs`
    {{#power-select-with-create
        search=(action "searchCountries")
        selected=selectedCountries
        onchange=(action (mut selectedCountries))
        oncreate=(action "createCountry")
        showCreateWhen=(action "shouldShowCreate")
        renderInPlace=true
         as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  typeInSearch('can');

  const options = findAll('.ember-power-select-option');
  assert.equal(options.length, 3);
  assert.equal(options[0].textContent.trim(), 'Add "can"...');
  assert.equal(options[1].textContent.trim(), 'Foo');
  assert.equal(options[2].textContent.trim(), 'Bar');
});


test('showCreatePosition works with async search', function(assert) {
  assert.expect(5);

  this.set('selectedCountries', []);
  this.set('show', true);
  this.on('searchCountries', () => {
    return new EmberPromise((resolve) => {
      resolve([{name: 'Foo'}, {name: 'Bar'}]);
    });
  });

  this.on('shouldShowCreate', (term) => {
    assert.equal(term, 'can');
    return this.get('show');
  });

  this.render(hbs`
    {{#power-select-with-create
        search=(action "searchCountries")
        selected=selectedCountries
        onchange=(action (mut selectedCountries))
        oncreate=(action "createCountry")
        showCreateWhen=(action "shouldShowCreate")
        showCreatePosition='bottom'
        renderInPlace=true
         as |country|
    }}
      {{country.name}}
    {{/power-select-with-create}}
  `);

  clickTrigger();
  typeInSearch('can');

  const options = findAll('.ember-power-select-option');
  assert.equal(options.length, 3);
  assert.equal(options[2].textContent.trim(), 'Add "can"...');
  assert.equal(options[0].textContent.trim(), 'Foo');
  assert.equal(options[1].textContent.trim(), 'Bar');
});
