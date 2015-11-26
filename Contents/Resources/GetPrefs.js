function getPrefs()
{
	var result = "";
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
					if ( queries[j].type == "hidden" )
						result += queries[j].name+" "+queries[j].value+" ";
					else if ( queries[j].type == "checkbox" )
					{
						result += queries[j].name+"-"+queries[j].value+" ";
						result += queries[j].checked ? "1 " : "0 ";
					}
					else if ( queries[j].checked )
						result += queries[j].name+" "+queries[j].value+" ";
				}
			}
			else
			{
				// Should be <select> element
				queries = queryelements[i].getElementsByTagName('select');
				if ( queries.length > 0 )
					result += queries[0].name+" "+queries[0].value+" ";
			}
		}
	}
	return result;
}
getPrefs();
