function isNumber(something){
	return !isNaN(something) && isFinite(something);
}

function isUndef(a){
	return typeof a === 'undefined';
}
function unics(arr){
	return arr.filter((v, i, a) => a.indexOf(v) === i);
}
function dictLen(dict){
	return Object.keys(dict).length
}
function timeFilter(d,h){
	return function (cours){
		for(let slot of cours.timeslots)
			if((slot.day === d || d==="") && (slot.time === h || h===""))
				return true;

		return false;	
	}
}
