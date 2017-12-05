function isNumber(something){
	return !isNaN(something) && isFinite(something);
}

function isUndef(a){
	return typeof a !== 'undefined';
}