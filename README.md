# jQuery Valida 2.1.3

Valida is a jQuery plugin which provides an easy, fast and lightweight way to make form validations on client-side. 
It's source-code (minified) has about *12Kb*.

[Live Demo](http://awin.com.br/valida)

## What's new in 2.1.3?

    * A "flag" mark that highlights required form fields.
    * Fixed bug for multiple filters.

[Live Demo](http://awin.com.br/valida/)

##Details

Validating a form on client-side, using Javascript, can be (at least for me is) a very boring and slower task! 

So, looking for a way to make it easyer and faster, I wrote this small, light, but very flexible plugin to do 
the hard and boring job, provindg a very smart way to validate web forms!

Since your are using *Valida*, you can expect:

- Each TEXTAREA, on your form, which has a maxlength property set, will receive a description label
(right below it) that displays the maxlength and how many chars were already typed!

- Each INPUT text field, on your form, which has a filter property set, will be analysed when the user 
is typing to inform him/her that the value is valid or invalid!

- During the validation process, each field on your form which has the "required" property set and has 
no value or has the "filter" property set and the value doesn't match the given filter, will receive a 
label  (right below it) with a error/invalid message.

- You also can run some stuff before/after the validation via callback methods and customize the messages 
and the layout of messages displayed!

- There are 18 filters available to be used.

##How to use it ?

Import the "valida.js" on the HEAD of your page:

```
<script type="text/javascript" src="valida.js" ></script>
```

Set what kind of fields are required and has filters:

```
<input type="text" ... required="true" /> <!-- required or -->
<input type="text" ... filter="email" /> <!-- filter */ or -->
<input type="text" ... required="true" filter="email" /> <!-- both -->
```

Then, you just need call it:

```
<script type="text/javascript" src="valida.js" ></script>
<script type="text/javascript" >
    jQuery(document).ready(function(){
       $('your-form').valida();
    });
</script>
```

Done!

##What'll happen ?

When you submit your form (as you usually may do), Valida'll get in action and make the analisys of your form, putting messages (error/warnings) when it's necessary and stopping the form submit for mistakes corrections, moreover, some other nice stuff.

----

Well, that's it! Easy, don't you?

If you have any suggestion, critics or just wanna say hello, feel free to mail me or leave a comments here.

Happy coding! =)

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/rogeriotaques/valida/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
