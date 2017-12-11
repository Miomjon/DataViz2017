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