



class TimeTable{

	constructor() {

		this.groups = {}
		this.slotDict = {}
		this.textInUse = {}
		this.tableAbsOrigin = ""
	    this.isDisplayBig = false;
	    this.classDict = [DaViSettings.cellCourseClass,DaViSettings.cellExerciseClass]
	    this.cellDimWmargin = DaViSettings.tableDimSmall.minus(DaViSettings.dayshoursDivOffset).divide(DaViSettings.days.length,DaViSettings.dayEnd-DaViSettings.dayStart);
		this.cellDim = this.cellDimWmargin.minus(DaViSettings.cellMargin.time(2));
  	}
	

	cellBackId(dayIndex,hourIndex){
		return DaViSettings.cellBackId+"_"+dayIndex+"_"+hourIndex;
	}
	cellPos(cellId){
		let sub = cellId.substring(DaViSettings.cellBackId.length+1,cellId.length)
		return new Vec(sub.split("_"));
	}

	alignText(text,boxPos,boxDim,trTime){
		let backMid = boxDim.divide(2)

		let textPos = this.tableAbsOrigin.plus(boxPos);

		if(trTime){
			text = text.transition()
				.duration(trTime)
				.ease(d3.easeCubicOut)
		}
		if(text.node().tagName.toLowerCase() == 'div'){
			text.style("left" , textPos.x+"px")
				.style("top" ,textPos.y+"px")
				.style("width",boxDim.x+"px")
				.style("height",boxDim.y+"px")
		}else{
			textPos = textPos.plus(backMid);
			text.attr("x" , textPos.x)
				.attr("y" ,textPos.y)
				.attr("width",boxDim.x)
				.attr("height",boxDim.y)
		}
		
	}
	resetCellText(key,trTime,mousepos){
		let tableDim = DaViSettings.tableDimSmall
		let text = d3.select("#"+key)
		if(isUndef(mousepos))
			mousepos = new Vec(tableDim.x + 100,tableDim.y/3);
		if(trTime)
			text = text.transition().duration(trTime).ease(d3.easeCubicOut)
		text.style("left",mousepos.x+"px")
			.style("top",mousepos.y+"px")
			.style('font-size',DaViSettings.cellFontVerySmall)
			.style("opacity",0);
	}
	setCellIsolated(key,color){
		let cell = d3.select("#"+key)
		if(!color)
			color = DaViSettings.cellDefaultColor
		let posTiled = this.cellPos(key)
		let pos = posTiled.time(this.cellDimWmargin).plus(DaViSettings.dayshoursDivOffset).plus(DaViSettings.cellMargin)
		let dim = this.cellDim
		cell.transition()
			.attr("x",pos.x)
			.attr("y",pos.y)
			.attr("width",dim.x)
			.attr("height",dim.y)
			.duration(DaViSettings.defaultDelay)
			.style("fill",color)
			.ease(d3.easeCubicOut)
	}
	setInGroup(key,isFirst,isLast,color){
		let cell = d3.select("#"+key)
		if(!color)
			color = DaViSettings.cellDefaultColor
		let posTiled = this.cellPos(key)

		let dim = this.cellDim
		let cellDimWmargin = this.cellDimWmargin;
		let pos = posTiled.time(cellDimWmargin)
		pos = pos.plus(DaViSettings.dayshoursDivOffset).plus(DaViSettings.cellMargin)
		if(isFirst)
			pos = pos.plus(DaViSettings.cellMargin)
		else{
			pos = pos.plus(DaViSettings.cellMargin.x,0)
			dim = dim.plus(0,DaViSettings.cellMargin.y)
		}
		if(!isLast)
			dim = dim.plus(0,DaViSettings.cellMargin.y)
		cell.transition()
			.attr("x",pos.x)
			.attr("y",pos.y)
			.attr("width",dim.x)
			.attr("height",dim.y)
			.duration(DaViSettings.defaultDelay)
			.style("fill",color)
			.ease(d3.easeCubicOut)
	}
	appendCourseToDict(coursId,shouldGroup){

		let newSlots = {}
		let newGroups = {}
		let timetable =this;
		function group(id,slot){

			let g = {start:new Vec(slot.day,slot.time),height : 1, firstSlot : slot,itemIndex:-1}
			let groupOf = timetable.groups[id];
			if(!groupOf)
				groupOf = []
			groupOf.push(g)
			timetable.groups[id] = groupOf;


			let groupOfNew = newGroups[id] ;
			if(!groupOfNew)
				groupOfNew = []
			groupOfNew.push(g)
			newGroups[id] = groupOfNew;

			return g
		}
		function entry(id,slot){
			let key = timetable.cellBackId(slot.day,slot.time)
			let slotsNow = timetable.slotDict[key] 
			if(!slotsNow)
				slotsNow = {}
			slotsNow[id] = slot
			timetable.slotDict[key] = slotsNow;

			let slotsNowNew = newSlots[key];
			if(!slotsNowNew)
				slotsNowNew = {}

			slotsNowNew[id] = slot
			newSlots[key] = slotsNowNew;
		}
		let course = ISA_data[coursId];
		let groupedSlot = [];
		if(course.timeslots.length > 0){
			let sortedSlots = course.timeslots.slice().sort(ts => ts.day*100 + ts.time);
			sortedSlots.reverse();
			let firstOfWeek = sortedSlots.shift()
			entry(coursId,firstOfWeek)
			let lastGroup = group(coursId,firstOfWeek)
			let last = firstOfWeek
			for(let slot of sortedSlots){
				entry(coursId,slot)
				if(last.day == slot.day && shouldGroup(last,slot)){
					lastGroup.height +=1;
				}
				else{
					last = slot;
					lastGroup = group(coursId,slot)

				}
				last = slot;
			}

		} 	
		
		return {slotDict:newSlots,groups:newGroups}
	}
	
	
	takeTextId(){
		for(let i = 0; i < DaViSettings.tableTextCount; i++){
			if(!this.textInUse[i]){
				this.textInUse[i] = true
				return i;
			}
		}
	}
	freeTextId(i){
		this.textInUse[i] = false
	}
	initTimetable() {
		let figure = d3.select("#"+DaViSettings.timeTableId);
		let tableBody = d3.select("#"+DaViSettings.timeTableDivId);

		figure.selectAll("*").remove();
		let tableDim = DaViSettings.tableDimSmall
		figure.attr("width",tableDim.x)
			.attr("height",tableDim.y)
		let offset = DaViSettings.dayshoursDivOffset
		let cellMargin = DaViSettings.cellMargin;
		let tableBox = tableBody.node();
		this.tableAbsOrigin = offset.plus(tableBox.offsetLeft ,tableBox.offsetTop);
		for(let day = 0;day<DaViSettings.days.length;day++){
			for (let hour = 0; hour < DaViSettings.dayEnd-DaViSettings.dayStart; hour++)
				figure.append("rect")
					.attr("x",this.cellDimWmargin.x * day + cellMargin.x + offset.x)
					.attr("y",this.cellDimWmargin.y * hour + cellMargin.y + offset.y )
					.attr("width",this.cellDim.x)
					.attr("height",this.cellDim.y)
					.attr("id",this.cellBackId(day,hour))
					.attr('fill',DaViSettings.cellDefaultColor);
		}
		for(let day = 0;day<DaViSettings.days.length;day++){
			let text = figure.append("text")
					.attr("x",this.cellDimWmargin.x * day + cellMargin.x + offset.x)
					.attr("y",0)
					.style('text-anchor', 'middle')
					.text(DaViSettings.days[day])
			this.alignText(text,new Vec(this.cellDimWmargin.x * day + cellMargin.x + offset.x, 0).minus(this.tableAbsOrigin), new Vec(this.cellDimWmargin.x,offset.y),200)	
		}
		for(let hour = DaViSettings.dayStart;hour <= DaViSettings.dayEnd;hour++){
			let posY = (hour - DaViSettings.dayStart) * this.cellDimWmargin.y + offset.y;
			figure.append("text")
				.attr("x",-80)
				.attr("y",posY)
				.text(""+hour+" _ ")
				.transition()
				.duration(500)
				.attr("x",cellMargin.x)
				.ease(d3.easeCubicOut)
		}
		for(let i = 0 ;i < DaViSettings.tableTextCount;i++){

			let txt = tableBody.append("div")
				.attr("id",DaViSettings.cellTextId+i)
				.classed(DaViSettings.cellTextClass,true)
				.style('text-anchor', 'middle')
			this.mkText(txt)
			this.resetCellText(DaViSettings.cellTextId+i)
				
		}
		

	}
	addCourse(coursId,mousePos){
		if(this.groups[coursId])
			return
		let news = this.appendCourseToDict(coursId,(a,b)=> a.activity === b.activity && a.time+1 == b.time);
		let newGroups = news.groups
		let newSlots = news.slotDict
		let gcNow = Object.keys(this.groups).length
		let gcBefore = gcNow - Object.keys(newGroups).length
		let i = gcBefore
		let cellDim = this.cellDim;
		for(let groupId in newGroups){
			for(let group of newGroups[groupId]){
				group.itemIndex = this.takeTextId();
				let groupStart = group.start;
				
				if(!isUndef(mousePos)){
					d3.select("#"+DaViSettings.cellTextId+group.itemIndex).style("left" , mousePos.x+"px")
						.style("top" ,mousePos.y+"px")
				}
				let textOnTheWay = this.fillText(d3.select("#"+DaViSettings.cellTextId+group.itemIndex),groupId,ISA_data[groupId])
					.transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeCubicOut)
					.style('font-size',DaViSettings.cellFontDefault)
					.style("opacity",1);
				this.alignText(textOnTheWay,groupStart.time(this.cellDimWmargin).plus(DaViSettings.cellMargin),cellDim.time(1,group.height))

				for(let t = 0; t <group.height;t++){
					let key = this.cellBackId(group.firstSlot.day,group.firstSlot.time+t)
					let slot = this.slotDict[key][groupId]
					this.setInGroup(key,t==0,t==group.height-1,DaViSettings.cellColorMap[slot.activity])
				}
				i++;
			}
		}
		
	}
	removeGroupFromSlots(groups,coursId){
		for(let g of groups){
			for(let i =0; i < g.height;i++){
				let key = this.cellBackId(g.firstSlot.day,g.firstSlot.time+i)
				let slots = this.slotDict[key]
				if(slots){
					delete this.slotDict[key][coursId];
				}
				if(!Object.keys(slots).length){
					this.setCellIsolated(key);
				}	
				
			}
		}
	}
	mkText(text){
		text.append("div")
			.classed(DaViSettings.cellCodeDiv,true)
			.classed(DaViSettings.cellTextVis+"0",true)
			.classed(DaViSettings.cellTextVis+"2",true)
		text.append("div")
			.classed(DaViSettings.cellNameDiv,true)
			.classed(DaViSettings.cellTextVis+"1",true)
			.classed(DaViSettings.cellTextVis+"2",true)
		text.append("div")
			.classed(DaViSettings.cellRoomDiv,true)
			.classed(DaViSettings.cellTextVis+"2",true)
	}
	fillText(text,coursName,coursData){
		let codeA = text.append("div")
			.classed(DaViSettings.cellTextVis+"0",true)
			.classed(DaViSettings.cellTextVis+"2",true)
		let nameA = text.append("div")
			.classed(DaViSettings.cellTextVis+"1",true)
			.classed(DaViSettings.cellTextVis+"2",true)
		let roomA = text.append("div")
			.classed(DaViSettings.cellTextVis+"2",true)
		text.select("."+DaViSettings.cellCodeDiv).text(coursData.code)
		text.select("."+DaViSettings.cellNameDiv).text(coursName)
		text.select("."+DaViSettings.cellRoomDiv).text(coursData.timeslots[0].room.join())
		return text;

	}
	setLevelOpcaity(level,opacity,target){
		if(isUndef(target))
			target = d3;
		let t = target.selectAll("."+DaViSettings.cellTextVis+level)
				.transition()
				.duration(DaViSettings.shortNoticeableDelay)
				.ease(d3.easeCubicOut)
				.style("opacity",opacity)
		if(opacity == 0)
			t.style("height",0+"px")
		else
			t.style("height","auto");
				
		
	}
	removeCourse(coursId,mousepos){
		let deletedGroups = this.groups[coursId]
		if(!deletedGroups)
			return

		let deletedSlots = this.slotDict[coursId]

		this.removeGroupFromSlots(deletedGroups,coursId);

		let maxId = Object.keys(this.groups).length;
		for (let deletedGroup of deletedGroups){
			let oldGroupId = deletedGroup.itemIndex
			this.freeTextId(oldGroupId)
			this.resetCellText(DaViSettings.cellTextId + oldGroupId,DaViSettings.defaultDelay,mousepos)
		}
		delete this.groups[coursId]
		delete this.slotDict[coursId]

	}
	resizeCell(cell,dims,time,onEnd){
		let back = cell.back;
		let text = cell.text;
		let boxPos = Vec.Pos(back);

		let txtDim = Vec.Dim(text.getBBox());

		let txtMid = txtDim.divide(2);

		let backDim = Vec.Dim(back.getBBox())

		let backMid = backDim.divide(2);

		let pos = backMid.minus(txtMid).plus(boxPos);
		text.setAttribute("x", ""+pos.x);
		text.setAttribute("y", ""+pos.y);
		rescale(back,dims,time,onEnd)

	}
	rescaleAllCell(scale,time,onEnd){
		let end = onEnd;
		for (let cell of this.cells){
			let backBox = cell.back.getBBox()
			let backDim = Vec.Dim(backBox);
			let newDims = backDim.time(scale);
			this.resizeCell(cell,newDims,time);

		} 
		setTimeout(onEnd,time);
	}
	switchDisplayMode(){
		let table = document.getElementById(DaViSettings.timeTableId);
		let button = document.getElementById(DaViSettings.rescaleTableButtonId);
		
		if(this.isDisplayBig){

			this.setLevelOpcaity(1,0)
			this.setLevelOpcaity(2,0)
			this.setLevelOpcaity(0,1)
			this.isDisplayBig = false
		}else{
			this.setLevelOpcaity(1,1)
			this.setLevelOpcaity(2,1)
			this.setLevelOpcaity(0,1)
			this.isDisplayBig = true
		}
	}
}

var timtable = new TimeTable()
timtable.initTimetable(ISA_data,false)
testThing =document.getElementById(DaViSettings.rescaleTableButtonId) 
testThing.onclick = ()=>timtable.switchDisplayMode();

