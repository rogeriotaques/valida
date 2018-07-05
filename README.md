# Valida 3.0.0

Valida is a jQuery plugin for a quick and easy, yet powerful and flexible client-side form validations. It is full customizable and localizable thru its <code>options</code>.

[LIVE DEMO HERE](https://rogeriotaques.github.io/valida)

## Get started

Download or clone this project.

Copy either <code>valida.3.x.x.js</code> or <code>valida.3.x.x-min.js</code> to your project (root) folder. Just add the <code>required</code> attribute to any mandatory field from your form, and <code>data-filter</code> to those with special validation requirements.

```html
<form id="my-form" >
  ...
  <input type="text"  ... required="true" /> <!-- required or -->
  <input type="email" ... data-filter="email" /> <!-- filter or -->
  <input type="text"  ... data-mask="date" /> <!-- mask or -->
  <input type="url"   ... required="true" data-filter="date" data-mask="date" /> <!-- both -->
  ...
</form>
```

At last but not least, finally you can call it, importing the library in your project page, after <code>jQuery</code>, and initializing the plugin.

```html
  <script type="text/javascript" src="/path/to/jquery.js" ></script>
  <script type="text/javascript" src="/path/to/valida.3.0.0-min.js" ></script>
  <script type="text/javascript" >
    $(function init() {
       $('#my-form').valida( /* options */ );
    })();
</script>
</body>
```

## Docs

Valida improves the UX on your apps while creating smooth client-side form validations. Valida depeds on jQuery.

[jQuery CDN](https://code.jquery.com/)

For a simple call, using the default options, do not pass the <code >options object</code>. For the advanced options and filters, see below.

```js
$('#your-form-id').valida(/* option */);
```

### Options

| Option            | Type            | Default                                                       | Remark                                                               |
| ----------------- | --------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| novalidate        | `bool`          | `true`                                                        | HTMLForm property                                                    |
| autocomplete      | `string`        | 'off'                                                         | HTMLForm property                                                    |
| tag               | `string|object` | 'span'                                                        | The HTMLElement used to show the validation erros                    |
| highlightMarker   | `string`        | '( Optional )'                                                | Tip used to highlight required/optional HTMLFormElements             |
| highlightPosition | `string`        | 'post'                                                        | Where the tip will be placed in the label                            |
| highlightOptional | `bool`          | `true`                                                        | Whether optional or mandatory HTMLFormElements should be highlighted |
| triggerOnBlur     | `bool`          | `true`                                                        | Check HTMLFormElement content on blur event                          |
| triggerOnTyping   | `bool`          | `true`                                                        | Check HTMLFormElement content on key up/down events                  |
| additionalClass   | `string`        | `null`                                                        | Additional classes to be added to the validation messages            |
| i18n              | `object`        |                                                               |
| i18n.submit       | `string`        | 'Wait ...'                                                    | All submit buttons on submit replacement                             |
| i18n.required     | `string`        | 'Required'                                                    | Validation error message for mandatory HTMLFormElements              |
| i18n.invalid      | `string`        | 'Seems to be invalid'                                         | Validation error message for invalid (filter) HTMLFormElements       |
| i18n.valid        | `string`        | 'It is valid!'                                                | Validation success message for valid (filter) HTMLFormElements       |
| i18n.maxlength    | `string`        | '&lt;span class="at-counter"&gt;{0}&lt;/span&gt; out of {1}.' | Tip for textarea HTMLFormElement when maxlength is defined           |
| beforeValidation  | `function`      | `null`                                                        | Callback invoked right before the validation                         |
| afterValidation   | `function`      | `null`                                                        | Callback invoked right after the validation                          |

### Filters

These are all supported filters. To enable the filter validation, you must add the `data-filter` attribute to your HTMLFormInputElements, e.g:

```html
<input type="text" data-filter="filter-name-here" >
```

Valida implements a smart filter detection, which means if your element is from any time that has a direct filter support (e.g: `email`, `url`, ...) that filter will be automatically enabled.

| Since  | Filter         | Example/Notation                  | Remark                                                                       |
| ------ | -------------- | --------------------------------- | ---------------------------------------------------------------------------- |
|        | `email`        | name@domain.com                   |
| v1.1.0 | `url`          | http://google.com                 |
|        | `number`       | 0123456789                        |
|        | `decimal`      | 1,234.56 or 1.234,56              |
|        | `date_br`      | 25/01/2012                        |
|        | `date`         | 2012-01-25                        |
|        | `time`         | 22:45                             |
|        | `phone_br`     | (12) 3456-7890 or (12) 93456-7890 | Updated (v1.3.6) to support the 9th digit of brazilians mobile phone numbers |
|        | `phone_jp`     | (0123) 45-6789 or (123) 4567-8901 |
|        | `zipcode_us`   | A1B2C3                            |
|        | `zipcode_br`   | 12345-678 or 12.345-678           |
|        | `zipcode_jp`   | 123-4567                          |
| v1.2.0 | `valid_ip`     | from 0.0.0.0 to 255.255.255.255   |
|        | `min_length`   | min_length:`value`                |
|        | `max_length`   | max_length:`value`                |
|        | `matches`      | matches:`field-id`                |
|        | `greater_than` | greater_than:`value`              |
|        | `less_than`    | less_than:`value`                 |
| v2.1.7 | `cpf`          | cpf:`field-id`                    | Thanks to `Eduardo Barros` for his request.                                  |
| v2.1.7 | `cnpj`         | cnpj:`field-id`                   |

### Masks

Valida version 3 also implements a very handy `mask` feature.

To enable masks for your form fields and allow Valida to take over and manage it, will must add the `data-mask` attribute to the element. E.g:

```html
<input type="text" data-mask="mask-name" > <!-- using a pre-defined mask  OR-->
<input type="text" data-mask="XX/XX/XX" > <!-- defining a mask -->
```

| Name         | Mask                 | Example            |
| ------------ | -------------------- | ------------------ |
| `date`       | `XXXX-XX-XX`         | 2018-01-01         |
| `postalcode` | `XXX-XXXX`           | 123-4567           |
| `cpf`        | `XXX.XXX.XXX-XX`     | 123.456.789-00     |
| `cnpj`       | `XX.XXX.XXX/XXXX-XX` | 12.345.678/0000-11 |

## Contributions

Contributions are very welcome. Since I am maintaining this library in my spare time, which is kinda rare nowadays, I trully appeciate any contribution. You can help:

- [Submitting pull requests](https://github.com/rogeriotaques/valida/pulls) or
- [Reporting bugs](https://github.com/rogeriotaques/valida/issues)
