



class TimeTable{

	constructor() {

		this.groups = {}
		this.slotDict = {}
		this.textInUse = {}
	    this.isDisplayBig = false;
	    this.classDict = [DaViSettings.cellCourseClass,DaViSettings.cellExerciseClass]
	    this.cellDimWmargin = DaViSettings.tableDimSmall.minus(DaViSettings.dayshoursDivOffset).divide(DaViSettings.days.length,DaViSettings.dayEnd-DaViSettings.dayStart);
		this.cellDim = this.cellDimWmargin.minus(DaViSettings.cellMargin.time(2));
  	}
	createCell(cellKey) {

		let id =  DaViSettings.cellId+cellKey;
		let cell = document.createElement("td");
		let cellDiv = document.createElement("div");
		cell.id = id;
		cell.className = DaViSettings.cellDefaultClass;

		cellDiv.id = DaViSettings.cellDivId+cellKey;
		cell.appendChild(cellDiv)

		let cellA = document.createElement("a");
		cellA.id = DaViSettings.cellAId+cellKey;
		cellDiv.appendChild(cellA)
		return cell;
	}

	cellBackId(dayIndex,hourIndex){
		return DaViSettings.cellBackId+"("+(hourIndex+DaViSettings.dayStart)+"_"+dayIndex+")";
	}
	cellPos(cellId){
		let sub = cellId.substring(DaViSettings.cellBackId.length+1,cellId.length-2)
		return new Vec(sub.split("_"));
	}

	alignText(text,boxPos,boxDim,trTime){
		let backMid = boxDim.divide(2)

		let textPos = boxPos.plus(backMid)
		if(trTime){
			text.transition()
				.duration(trTime)
				.attr("x",textPos.x)
				.attr("y",textPos.y)
				.ease(d3.easeCubicOut)
		}else{
			text.attr("x",textPos.x)
				.attr("y",textPos.y)
		}
		
	}
	setCellIsolated(key,color){
		let cell = d3.select("#"+key)
		if(!color)
			color = DaViSettings.cellDefaultColor
		let posTiled = this.cellPos(key)
		let pos = posTiled.time(cellDimWmargin).plus(DaViSettings.dayshoursDivOffset).plus(DaViSettings.cellMargin)
		let dim = cellDim
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

		let dim = cellDim
		let pos = posTiled.time(cellDimWmargin).plus(DaViSettings.dayshoursDivOffset).plus(DaViSettings.cellMargin)
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
	mkInfoDict(courseOfWeek,shouldGroup){

		let newSlots = {}
		let newGroups = {}
		function group(id,slot){

			let g = {start:new Vec(slot.day,slot.time),height : 1, firstSlot : slot,itemIndex:-1}
			let groupOf = this.groups[id] | [];
			groupOf.push(g)
			this.groups[id] = g;


			let groupOfNew = this.newGroups[id] | [];
			groupOfNew.push(g)
			this.newGroups[id] = g;

			return g
		}
		function entry(id,slot){
			let key = this.cellBackId(slot.day,slot.time)
			let slotsNow = this.slotDict[key] | {};
			slotsNow[id] = slot
			this.slotDict[key] = slotsNow;

			let slotsNowNew = this.newSlots[key] | {};
			slotsNowNew[id] = slot
			this.newSlots[key] = slotsNowNew;
		}
		for(let coursId in courseOfWeek){
			course = courseOfWeek[coursId];
			let groupedSlot = [];
			if(course.timeslots.length > 0){
				let sortedSlots = course.timeslots.sort(ts => ts.day*100 + ts.time);
				sortedSlots.reverse();
				let firstOfWeek = sortedSlots.shift()
				entry(firstOfWeek)
				let lastGroup = group(coursId,firstOfWeek)

				for(let slot of sortedSlots){
					entry(slot)
					if(last.day == slot.day && shouldGroup(last,slot)){
						lastGroup.height +=1;
					}
					else{
						lastGroup = group(coursId,slot)

					}
				}
				back.last = true;

			} 	
		}
		return {slotDict:newSlots,groups:newGroups}
	}
	
	resetCellText(text,trTime){
		if(trTime)
			text = text.transition.duration(trTime).ease(d3.easeCubicOut)
		text
			.attr("x",tableDim.x + 100)
			.attr("y",tableDim.y/3)
			.style('font-size',DaViSettings.cellFontVerySmall);
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
		figure.selectAll("*").remove();
		let tableDim = DaViSettings.tableDimSmall
		figure.attr("width",tableDim.x)
			.attr("height",tableDim.y)
		let offset = DaViSettings.dayshoursDivOffset
		let cellMargin = DaViSettings.cellMargin;

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
					.attr('text-anchor', 'middle')
					.text(DaViSettings.days[day])
			this.alignText(text,new Vec(this.cellDimWmargin.x * day + cellMargin.x + offset.x,0),new Vec(this.cellDimWmargin.x ,offset.y),200)	
		}
		for(let hour = DaViSettings.dayStart;hour <= DaViSettings.dayEnd;hour++){
			let posY = (hour - DaViSettings.dayStart) * this.cellDimWmargin.y + offset.y;
			figure.append("text")
				.attr("x",-80)
				.attr("y",posY)
				.text(""+hour)
				.transition()
				.duration(500)
				.attr("x",cellMargin.x)
				.ease(d3.easeCubicOut)
		}
		for(let i = 0 ;i < DaViSettings.tableTextCount;i++){

			let txt = figure.append("text")
				.attr("id",DaViSettings.cellTextId+i);
				.attr('text-anchor', 'middle')
			resetCellText(txt)
				
		}
		

	}
	addCourse(coursId){
		if(this.groups[coursId])
			return
		let data = ISA_data[coursId];
		let news = this.mkInfoDict(data,(a,b)=> a.day == b.day && a.activity === b.activity && a.time+1 = b.time);
		let newGroups = news.groups
		let newSlots = news.slotDict
		let gcNow = Object.keys(this.groups).length
		let gcBefore = gcNow - Object.keys(newGroups).length
		let i = gcBefore
		let cellDim = this.cellDimWmargin;
		for(let groupId in newGroups){
			let group = newGroups[groupId]
			group.itemIndex = this.resetCellText(oldKey);
			let groupStart = group.start;
			let textOnTheWay = d3.select("#"+DaViSettings.cellTextId+group.itemIndex)
				.text(groupId)
				.transition()
				.duration(DaViSettings.shortNoticeableDelay)
				.ease(d3.easeCubicOut)
				.style('font-size',DaViSettings.cellFontDefault);
			this.alignText(textOnTheWay,groupStart.time(cellDim),cellDim.time(1,group.height))

			for(let t = 0; t <group.height;t++){
				let key = this.cellBackId(g.firstSlot.day,d.firstSlot.time+t)
				let slot = this.slotDict[key]
				this.setInGroup(key,t==0,t==group.height-1,DaViSettings.cellColorMap[slot.activity])
			}
			i++;
		}
		
	}
	removeGroupFromSlots(groups){
		for(g of groups){
			for(let i =0; i < g.height;i++){
				let key = this.cellBackId(g.firstSlot.day,d.firstSlot.time+i)
				let slots = this.slotDict[key]
				if(slots){
					delete slots[key];
				}
				if(Object.keys(this.slots).length){
					this.setCellIsolated(key);
				}
			}
		}
	}
	revomeCourse(coursId){
		let deletedGroups = this.groups[coursId]
		if(!deletedGroups)
			return

		let deletedSlots = this.slotDict[coursId]

		this.removeGroupFromSlots(deletedGroups);

		let maxId = Object.keys(this.groups).length;
		for (deletedGroup of deletedGroups){
			let oldGroupId = deletedGroup.itemIndex
			this.freeTextId(oldGroupId)
			this.resetCellText(oldKey)
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
			button.innerHTML = '';

			rescale(button,new Vec(20,0),100, ()=>{
				this.initTimetable(ISA_data,false)
				this.rescaleAllCell( //Here it faile if we use this, despite the => opperator
					DaViSettings.cellBigScale.invert(),
					200,
					()=>{
						
						rescale(button,new Vec(20,20),100,()=>button.innerHTML = '<b>   ➕   </b> ');
					}
				);
			});
			this.isDisplayBig = false;
		}else{
			button.innerHTML = '';
			rescale(button,new Vec(20,0),100,()=>{
				this.rescaleAllCell(
					DaViSettings.cellBigScale,
					200,
					()=>{
						this.initTimetable(ISA_data,true);
						rescale(button,new Vec(20,20),100,()=>button.innerHTML = '<b>   ➖   </b>');
					}
				);
			});
			this.isDisplayBig = true;

		}
		
	}
	
}

var timtable = new TimeTable()
timtable.initTimetable(ISA_data,false)
testThing =document.getElementById(DaViSettings.rescaleTableButtonId) 
testThing.onclick = ()=>timtable.swithDisplayMode();

