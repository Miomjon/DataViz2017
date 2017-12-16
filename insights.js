class Insights{
	constructor(){
		d3.select("#creditsSum").text("0")
		d3.select("#workloadSum").text("0+0")
		d3.select("#mandCreditsSum").text("0")
		this.favoriteSpe = "";
		this.displayedSpe = [];
		this.starCenter = ""
		this.starAmrs = []
		this.mkStar()
		this.updateStartParams(true)
		d3.select("#insightfullPlot2")
			.on("resize",()=>this.updateStartParams(false),this.updateStar())
	}
	vecsToPointList(vecs){
		return vecs.map(v=>v.x+","+v.y).join(" ")
	}
	mkStar(){
		let svg = d3.select("#insightfullPlot2")
		let activities = DaViSettings.activities
		let zeroPoints = DaViSettings.workdays.map(x=>"0,0")
		zeroPoints.push(zeroPoints[0])
		zeroPoints = zeroPoints.join(" ");
		svg.selectAll("line")
			.data(DaViSettings.workdays)
			.enter()
			.append("line")
			.attr('id',d=>"StarLine"+d)
			.attr('x1',0)
			.attr('x2',0)
			.attr('y1',0)
			.attr('y2',0)
			.classed("starLine",true)
		svg.selectAll("polyline")
			.data(activities)
			.enter()
			.append("polyline")
			.attr("id",d=>"StartPoly"+d)
			.style("fill",d=>DaViSettings.cellColorMap[d])
			.attr("points",zeroPoints)
			.style("stroke-width","3px")
			.style("stroke",d=>{
				let col = d3.hsl(DaViSettings.cellColorMap[d]);
	            col.s *= 2 ;
	            col.l /= 2 ;
	            return col;
			})

		svg.selectAll("text")
			.data(DaViSettings.workdays)
			.enter()
			.append("text")
			.attr("text-anchor","middle")
			.attr("id",d=>"StarLabel"+d)
			.classed("StarLabel",true)
			.html(d=>d)
			.attr('x',1000)
			.attr('y',1000)
			.on("click",(d)=>{
				window.courselist.showTopSpe(
					d,
					"#F6630C",
					timeFilter(DaViSettings.days.indexOf(d),""))
				}
			);
	}
	updateStartParams(isInit){
		let parent = document.getElementById("insightfullPlot2").parentElement
		this.starCenter = new Vec(parent.clientWidth,parent.clientHeight).divide(2);
		let armLength = Math.min(this.starCenter.x,this.starCenter.y) * DaViSettings.startArmLenght;
		this.starAmrs = []
		for(let i = 0;i<DaViSettings.workdays.length;i++){
			let angle = i * Math.PI * 2 / DaViSettings.workdays.length
			this.starAmrs.push([DaViSettings.workdays[i],new Vec(0,-armLength).rotate(angle)])
		}
		this.starAmrs.forEach((t)=>{
			let day = t[0];
			let vec = t[1];
			let outEnd = this.starCenter.plus(vec)
			let starline = d3.select("#StarLine"+day)
			if(isInit)
				starline = starline.transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeQuad)
					.attr("x1",this.starCenter.x)
					.attr("y1",this.starCenter.y)
					.attr("x2",this.starCenter.x)
					.attr("y2",this.starCenter.y)
					.delay(DaViSettings.shortNoticeableDelay)
			starline.transition()
				.duration(DaViSettings.shortNoticeableDelay)
				.ease(d3.easeQuad)
				.attr("x2",outEnd.x)
				.attr("y2",outEnd.y)
			let labelPos = outEnd.plus(vec.time(0.1))
			let starLabel = d3.select("#StarLabel"+day)
			if(isInit){
				let pos2 = outEnd.plus(vec.time(5))
				starLabel = starLabel.attr("x",pos2.x)
					.attr("y",pos2.y)
					.transition()
					.delay(DaViSettings.shortNoticeableDelay)
			}
			starLabel.transition()
				.duration(DaViSettings.shortNoticeableDelay)
				.ease(d3.easeQuad)
				.attr("x",labelPos.x)
				.attr("y",labelPos.y)
		})
		if(isInit){
			let activities = DaViSettings.activities
			let poses0 = DaViSettings.workdays.map(x=>this.starCenter.x+","+this.starCenter.y).join(" ")
			activities.forEach(a=>{
				d3.select("#StartPoly"+a)
					.transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeQuad)
					.attr("points",poses0)
			})
		}
		
		

	}
	
	updateStar(){
		let days = DaViSettings.workdays;
		let cumulativeworkloads = timtable.getDetailledDailyWorkload();
		let reversedActivity = DaViSettings.activities.slice()
		let max = 1.0;
		reversedActivity.reverse()
		for(let i =0;i<reversedActivity.length-1;i++){
			let act = reversedActivity[i]
			let nextAct = reversedActivity[i+1];
			for(let d = 0;d<days.length;d++){
				cumulativeworkloads[nextAct][d]+=cumulativeworkloads[act][d];
				if(cumulativeworkloads[nextAct][d]> max)
					max = cumulativeworkloads[nextAct][d];
			}
		}
		let hourPerDay = DaViSettings.dayEnd - DaViSettings.dayStart;
		reversedActivity.forEach(activity =>{
			let cwork = cumulativeworkloads[activity]
			let vecWork = []
			for(let i =0;i<cwork.length;i++){
				vecWork.push(this.starCenter.plus(this.starAmrs[i][1].time(cwork[i]/max)))
			}
			
			vecWork.push(vecWork[0]);
			d3.select("#StartPoly"+activity)
				.transition()
				.duration(DaViSettings.shortNoticeableDelay)
				.ease(d3.easeQuad)
				.attr("points",this.vecsToPointList(vecWork))
		})

	}

 	speColor(speLetter){
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
			if(courselist.topSpe.length <= 1){
				if( this.favoriteSpe && speToDisplay.findIndex(a=>a[0]===this.favoriteSpe )<0){
					this.favoriteSpe = "";
				}
			}
			else
				this.favoriteSpe = courselist.topSpe;
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
				slot.select('#speName')
					.text(name)
					.transition()
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
				let specolor = this.speColor(name)
				slot.select('rect')
					.on("click",()=>{
						this.favoriteSpe = name;
						courselist.showTopSpe(name,specolor);
					})
					.transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeQuad)
					.attr("y",-height)
					.attr("height",height)
					.attr("width",spePlotSquare.x)
					.style("fill",specolor)
					
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
		if(!this.favoriteSpe && speToDisplay.length)
			courselist.showTopSpe(speToDisplay[0][0],this.speColor(speToDisplay[0][0]))

			

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
		let credSumColor ="black"
		if(totalCreditCount>=35)
			credSumColor = "#FD7C04"
		d3.select("#creditsSum").transition()
			.duration(DaViSettings.shortNoticeableDelay)
			.ease(d3.easeQuad)
			.tween("text", function() {
	            var that = d3.select(this),
	                i = d3.interpolateNumber(that.text(), totalCreditCount);
	            return function(t) { that.text(Math.round(i(t))); };
	          })
			.style("color",credSumColor)

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
		this.updateStar()
	}
	onCreditClicked(){
		courselist.showTopSpe(0,"#062F4F",(c)=>c.credits+" credits");
	}
	onLegenClicked(act,actname, color){
		courselist.showTopSpe(actname,color,(c)=>c.timeslots.findIndex(s=>s.activity == act)>-1);
	}
}

insightsHandle = new Insights()

