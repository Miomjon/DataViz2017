class Insights{
	constructor(){
		d3.select("#creditsSum").text("0")
		d3.select("#workloadSum").text("0+0")
		d3.select("#mandCreditsSum").text("0")
		this.displayedSpe = [];
	}
	updateSpe(speCreds){
		let unusedSlots = DaViSettings.maxDisplayedSpe - dictLen(this.displayedSpe)
		let speToDisplay = []

		let removed = []
		for(let spe in speCreds){
			speToDisplay.push([spe,speCreds[spe]])
		}
		speToDisplay.sort((a,b)=>b[1]-a[1])
		speToDisplay =speToDisplay.slice(0,DaViSettings.maxDisplayedSpe);
		let specount = speToDisplay.length
		let svg = d3.select("#"+DaViSettings.spePlotId)
		let svgnode = svg.node().parentElement
		let svgDim = new Vec(svgnode.clientWidth,svgnode.clientHeight)

		let barSep = DaViSettings.spePlotBarMargin * svgDim.x
		let translate0 = svgDim.time(DaViSettings.spePlotRectO).plus(barSep/4,0)
		if(specount){
			
			let spePlotSquare = new Vec(Math.min((svgDim.x-translate0.x)/specount - barSep * (specount-1),DaViSettings.peBarMaxWidth * svgDim.x),translate0.y/speToDisplay[0][1]);

			function mkSlot(slotId){
				let g = svg.append("g")
				g.attr("transform", "translate(1000,"+translate0.y+")")
					.attr('id',slotId)
				g.append("rect")
					.attr("x","0")
					.attr("y",translate0.y - spePlotSquare.y)
					.attr("height",1)
					.attr("width",spePlotSquare.x)
					.style("fill","lightgray")
				g.append("text")
					.attr('id','speCredTxt')
					.text("-42")
					.attr("x",spePlotSquare.x/2)
					.attr("text-anchor","middle")
				g.append('text')
					.attr('id','speName')
					.text("a spe")
					.attr("y",15)
					.attr("x",spePlotSquare.x/2)
					.attr("text-anchor","middle")
				return g;	
			}
			function speColor(speLetter){
				let index = speLetter.charCodeAt(0)-"A".charCodeAt(0);
				let map ="1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666";
				let mapLength = map.length/6;
				while(index>=mapLength){
					index -= mapLength;
					let c= map.charAt(0)
					map = map.substring(1)
					map +=c;
				}
				index*=6;
				return "#"+map.substring(index,index+6);
			}
			function getSlot(speId){
				if(document.getElementById(speId))
					return d3.select("#"+speId)
				if(removed.length){
					let freedId = "speGPrefix_"+removed.pop();
					return d3.select("#"+freedId)
						.attr("id",speId)
				}else if(unusedSlots){
					unusedSlots--;
					
					return mkSlot(speId)
				}
				console.log("No available slots for the spe chart")
			}
			for(let displayed of this.displayedSpe){
				if(speToDisplay.findIndex(a=>a[0]===displayed)<0)
					removed.push(displayed)
			}
			let place = 0
			this.displayedSpe = [];
			for(let dispe of speToDisplay){
				let name = dispe[0]
				this.displayedSpe.push(name)
				let speId = "speGPrefix_"+name;
				let cred = dispe[1];
				let slot = getSlot(speId)
				let translation = translate0.plus((spePlotSquare.x+barSep)*place,0)
				let height = cred * spePlotSquare.y;
				slot.transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeQuad)
					.attr("transform", "translate"+translation)
				slot.select('#speName').text(name).transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeQuad)
					.attr("x", spePlotSquare.x/2)

				slot.select('#speCredTxt').transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeQuad)
					.attr("y",-height+20)
					.attr("x", spePlotSquare.x/2)
					.tween("text", function() {
			            var that = d3.select(this),
		                i = d3.interpolateNumber(that.text(), cred);
			            return function(t) { that.text(Math.round(i(t))); };
			          })
				slot.select('rect')
					.transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeQuad)
					.attr("y",-height)
					.attr("height",height)
					.attr("width",spePlotSquare.x)
					.style("fill",speColor(name))
				place ++;
			}
		}else{
			removed = this.displayedSpe;
			this.displayedSpe = [];
		}
		for(let remove of removed){
			let speId = "speGPrefix_"+remove;
			d3.select("#"+speId).transition()
				.duration(DaViSettings.shortNoticeableDelay)
				.ease(d3.easeQuad)
				.attr("transform", "translate(1000,"+translate0.y+")")
				.remove();

		}	

	}
	update(courses){
		function isObl(c){
	      if(DaViSettings.userSection === "IN")
	        return c.mandatory_I
	      return c.mandatory_C
	    }
		let totalCreditCount = 0
		let mandCreditCount = 0
		let hoursSum = 0
		let slotDict = {};
		let speCreds = {};
		for(let course of courses){
			let courseinfo = ISA_data[course]
			totalCreditCount += courseinfo.credits;
			if(isObl(courseinfo)){
				mandCreditCount+=courseinfo.credits;
			}
			for(let slot of courseinfo.timeslots){
				slotDict[slot.day+"_"+slot.time] = true;
			}
			hoursSum = dictLen(slotDict)
			let speAllSec = courseinfo.specialisations
			for(let spe of speAllSec[DaViSettings.userSection]){
				if(!speCreds[spe])
					speCreds[spe] = 0;
				speCreds[spe] += courseinfo.credits;
			}
		}
		d3.select("#creditsSum").transition()
			.duration(DaViSettings.shortNoticeableDelay)
			.ease(d3.easeQuad)
			.tween("text", function() {
	            var that = d3.select(this),
	                i = d3.interpolateNumber(that.text(), totalCreditCount);
	            return function(t) { that.text(Math.round(i(t))); };
	          })
		d3.select("#mandCreditsSum").transition()
			.duration(DaViSettings.shortNoticeableDelay)
			.ease(d3.easeQuad)
			.tween("text", function() {
	            var that = d3.select(this),
	                i = d3.interpolateNumber(that.text(), mandCreditCount);
	            return function(t) { that.text(Math.round(i(t))); };
	          })
		d3.select("#workloadSum").transition()
			.duration(DaViSettings.shortNoticeableDelay)
			.ease(d3.easeQuad)
			.tween("text", function() {
	            var that = d3.select(this)
	            let spl = that.text().split("+")
	            let i1 = d3.interpolateNumber(spl[0], hoursSum)
	            let i2 = d3.interpolateNumber(spl[1], totalCreditCount*2-hoursSum);
	            return function(t) { that.text(Math.round(i1(t))+"+"+ Math.round(i2(t))); };
	          })
		this.updateSpe(speCreds)
	}
}

insightsHandle = new Insights()

