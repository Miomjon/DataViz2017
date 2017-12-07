class Vec{
	constructor(...args) {
		

		let aX = "";
		let aY = "";
		if(args.length >=2){
			aX=args[0];
	    	aY=args[1];
		}else{
			let something = args[0];
			function check(a,b){
				let aVal = parseFloat(something[a]);
				let bVal = parseFloat(something[b]);
				if(isNumber(aVal) && isNumber(bVal)){
					aX=aVal;
		    		aY=bVal;
		    		return true;
				}
				return false;
			}
			function err(){
				throw new Error("Cannot parse "+something)
			}
			
			check("x","y") || check(0,1) || err();
		}
	    this.x = aX
	    this.y = aY
	    this[0] = aX
	    this[1] = aY
  	}
  	static Dim(something){
  		let aX = "";
		let aY = "";
  		function isNumber(something){
			return !isNaN(something) && isFinite(something);
		}
  		function check(a,b){
				let aVal = parseFloat(something[a]);
				let bVal = parseFloat(something[b]);
				if(isNumber(aVal) && isNumber(bVal)){
					aX=aVal;
		    		aY=bVal;
		    		return true;
				}
				return false;
			}
			function err(){
				throw new Error("Cannot parse "+something)
			}
			function checkAttr(a,b){
				if(!(something.getAttribute && typeof something.getAttribute === 'function'))
					return false;
				let aVal = parseFloat(something.attr(a));
				let bVal = parseFloat(something.attr(b));
				if(isNumber(aVal) && isNumber(bVal)){
					aX=aVal;
		    		aY=bVal;
		    		return true;
				}
				aVal = parseFloat(something.getAttribute(a));
				bVal = parseFloat(something.getAttribute(b));
				if(isNumber(aVal) && isNumber(bVal)){
					aX=aVal;
		    		aY=bVal;
		    		return true;
				}
				
				return false;
			}
			check("width","height")  || checkAttr("width","height") || err();
  		
		return new Vec(aX,aY);
  	}
  	static Pos(something){
  		let aX = "";
		let aY = "";
		function isNumber(something){
			return !isNaN(something) && isFinite(something);
		}
  		function check(a,b){
				let aVal = parseFloat(something[a]);
				let bVal = parseFloat(something[b]);
				if(isNumber(aVal) && isNumber(bVal)){
					aX=aVal;
		    		aY=bVal;
		    		return true;
				}
				return false;
			}
			function err(){
				throw new Error("Cannot parse "+something)
			}
			function checkAttr(a,b){
				if(!(something.getAttribute && typeof something.getAttribute === 'function'))
					return false;
				let aVal = parseFloat(something.attr(a));
				let bVal = parseFloat(something.attr(b));
				if(isNumber(aVal) && isNumber(bVal)){
					aX=aVal;
		    		aY=bVal;
		    		return true;
				}
				aVal = parseFloat(something.getAttribute(a));
				bVal = parseFloat(something.getAttribute(b));
				if(isNumber(aVal) && isNumber(bVal)){
					aX=aVal;
		    		aY=bVal;
		    		return true;
				}
				
				return false;
			}
			check("x","y")  || checkAttr("x","y") || err();
  		return new Vec(aX,aY);

  	}

  	genBinOpp(f,args) {
  		if(args.length == 1){
  			let n = args[0]
  			if(!isNaN(parseFloat(n)) && isFinite(n))
  				return new Vec(f(this.x,n),f(this.y,n));
			return new Vec(f(this.x,n.x),f(this.y,n.y));
  		}else{
  			return new Vec(f(this.x,args[0]),f(this.y,args[1]));
  		}
  	}
  	plus(...arg){
  		return this.genBinOpp((a,b)=>a+b,arg);
  	}
  	minus (...arg){
  		return this.genBinOpp((a,b)=>a-b,arg);
  	}
  	time(...arg){
  		return this.genBinOpp((a,b)=>a*b,arg);
  	}
  	divide(...arg){
  		return this.genBinOpp((a,b)=>a/b,arg);
  	}

  	min(...arg){
  		return this.genBinOpp((a,b)=>Math.min(a,b),arg);
  	}
  	max(...arg){
  		return this.genBinOpp((a,b)=>Math.max(a,b),arg);
  	}
  	abs(){
  		return new Vec(Math.abs(this.x),Math.abs(this.y));
  	}
  	dot(...arg){
  		if(arg.length == 1){
  			let n = arg[0]
			return this.x*n.x+this.y*n.y
  		}else{
  			return this.x*arg[0]+this.y*arg[1]
  		}
  	}
  	neg(){
  		return new Vec(-this.y,-this.y)
  	}
  	invert(){
  		return new Vec(1.0/this.y,1.0/this.y)
  	}
  	
}