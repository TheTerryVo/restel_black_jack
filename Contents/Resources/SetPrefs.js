function turnOnElementByNameAndValue (name, value)
{
	if ( name.match(/(.*)-(.*)/) != null )
	{
		valueForCheckbox = (value == 0 ? false : true);
		name = RegExp.$1;
		value = RegExp.$2;
	}
	
	var i, j;
	var queryelements = document.getElementsByTagName('div');
	for ( i = 0 ; i < queryelements.length ; ++i )
	{
		if ( queryelements[i].className == "query" )
		{
			var queries = queryelements[i].getElementsByTagName('input');
			if ( queries.length > 0 )
			{
				for ( j = 0 ; j < queries.length ; ++j )
				{
					if ( queries[j].name == name && queries[j].value == value )
					{
						if ( queries[j].type == "checkbox" )
							queries[j].checked = valueForCheckbox;
						else if ( queries[j].type == "radio" )
							queries[j].checked = true;
					}
				}
			}
			else
			{
				// Should be <select> element
				queries = queryelements[i].getElementsByTagName('select');
				if ( queries.length > 0 )
				{
					var selector = queries[0];
					if ( selector.name == name )
					{
						for ( j = 0 ; j < selector.length ; ++j )
						{
							if ( selector[j].value == value )
								selector[j].selected = true;
						}
					}
				}
			}
		}
	}
}

function clearAllOptions ()
{
	var i, j;
	var queryelements = document.getElementsByTagName('div');
	for ( i = 0 ; i < queryelements.length ; ++i )
	{
		if ( queryelements[i].className == "query" )
		{
			var queries = queryelements[i].getElementsByTagName('input');
			if ( queries.length > 0 )
			{
				for ( j = 0 ; j < queries.length ; ++j )
					queries[j].checked = false;
			}
			else
			{
				// Should be <select> element
				queries = queryelements[i].getElementsByTagName('select');
				if ( queries.length > 0 )
				{
					var selector = queries[0];
					for ( j = 0 ; j < selector.length ; ++j )
						selector[j].selected = false;
				}
			}
		}
	}
}

function setPrefs ()
{
	clearAllOptions();

	var i;
	for ( i = 0 ; i < arguments.length ; i += 2 )
	{
		var name = arguments[i];
		var value = arguments[i+1];
		turnOnElementByNameAndValue(name, value);
	}
}
