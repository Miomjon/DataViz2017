

// Intelligent agent, DIS, Auto speech, -Intel Agents.
// Intelligent agent, ML

class TimeTable{


	constructor() {

		this.groups = {}
		this.slotDict = {}
		this.textInUse = {}
		this.tableAbsOrigin = ""
	    this.isDisplayBig = false;
	    this.classDict = [DaViSettings.cellCourseClass,DaViSettings.cellExerciseClass]
        
		this.getColor = (s)=>DaViSettings.cellColorMap[s.activity];

  	}

  	// Groups are reprentation of the div of text, they are called group because thier main use is to remember 
  	// consecutiv timeslot that can be merged together.
	Group(slot){
		function mk(slot){
			this.start=new Vec(slot.day,slot.time)
			this.height = 1
			this.itemIndex=-1
		}

		return new mk(slot);
	}

	// return theid of the cell from its tiled position (slot.day and slot.time)
	cellBackId(...args){

		if(args.length == 1){
			let v = args[0]
			let dayIndex = v[0]
			let hourIndex = v[1]
			return DaViSettings.cellBackId+"_"+dayIndex+"_"+hourIndex;
		}
		let dayIndex = args[0]
		let hourIndex = args[1]
		return DaViSettings.cellBackId+"_"+dayIndex+"_"+hourIndex;
	}
	cellPos(cellId){
		let sub = cellId.substring(DaViSettings.cellBackId.length+1,cellId.length)
		return new Vec(sub.split("_"));
	}

	// Alligne either svg text of the text div on the right place
	alignText(text,boxPos,boxDim,trTime){
		let backMid = boxDim.divide(2)

		let textPos = this.tableAbsOrigin.plus(boxPos);

		if(trTime){
			text = text.transition()
				.duration(trTime)
				.ease(d3.easeCubicOut)
		}
		if(text.node().tagName.toLowerCase() == 'div'){
			textPos = textPos.minus(DaViSettings.textOff)
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
	// hid the text div and rest paramter that could have been changed (for exemple if the cell was expanded.)
	resetCellText(key,trTime,mousepos){
		let tableDim = DaViSettings.tableDimSmall
		let text = d3.select("#"+key)
		if(!trTime)
			trTime = 0;
		if(isUndef(mousepos))
			mousepos = new Vec(tableDim.x + 100,tableDim.y/3);
		if(trTime)
			text = text.transition().duration(trTime).ease(d3.easeCubicOut)
		text.style("left",mousepos.x+"px")
			.style("top",mousepos.y+"px")
			.style('font-size',DaViSettings.cellFontVerySmall)
			.style("opacity",0)
			.transition()
			.style("left",-1000+"px")
			.style("top",-1000+"px")
			.style('padding',null)
			.style('box-shadow',null)
			.style('width',this.cellDim.x+"px")
			.attr("daviexpanded",false)
			.style('z-index',null)
	}
	// Reset the shadow 
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

	// Return a string that for the color of a shadow, if colors have more than one lement, return a pointer to a pattern. 
	// Create pattern when needed.
	getFilling(colors){
		colors = unics(colors)
		if(colors.length > 1){
			colors = colors.sort();
			let patterName = (DaViSettings.dashPatternPrefix + colors.join("_")).split("#").join("")

			if(!document.getElementById(patterName)){
				let patternDim = DaViSettings.dashdPatternDims
				let pattern = d3.select("#"+DaViSettings.timeTableId).select("defs")
					.append("pattern")
					.attr("id",patterName)
					.attr("width",patternDim.x)
					.attr('height',patternDim.y)
					.attr('patternUnits',"userSpaceOnUse")
					.attr('patternTransform',"rotate("+DaViSettings.dashedLineAngle+" 0 0)")
				let lineWidth = patternDim.x/colors.length;
				for(let i = 0;i< colors.length;i++){

					let c = d3.hsl(colors[i]);
					c.l /=2;
					c.s *= 2;
					let x = i*lineWidth + lineWidth/2;
					pattern.append("line")
						.attr("x1",x)
						.attr("x2",x)
						.attr("y1",0)
						.attr("y2",patternDim.y)
						.style("stroke",c.toString())
						.style("stroke-width",lineWidth);
				}

			}
			return 'url(#'+patterName+')'
		}
		let c = d3.hsl(colors[0]);
		c.l /=2;
		c.s *= 2;
		return c.toString();

	}
	// Refresh the color of the shadows behind a text div.
	updateGroupShadow(cellkey,group){
		let cell = d3.select("#"+cellkey)
		let posTiled = this.cellPos(cellkey)

		let slots = this.slotDict[cellkey]


		let isFirst = true;
		let isLast = true;
		let colors = [];
		if(dictLen(slots) == 1){
			isFirst = group.start.y === posTiled.y
			isLast = group.start.y + group.height === posTiled.y + 1;
			colors = [this.getGroupColor(group)]
		}else for(let courseId in slots){
			colors.push(this.getColor(slots[courseId]))
		}

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
		let fill = this.getFilling(colors);
		if(fill.startsWith('url')){
			cell.style("fill",fill)
		}
		else
			cell.transition()
				.duration(DaViSettings.defaultDelay)
				.ease(d3.easeCubicOut)
				.style("fill",fill)
				.attr("x",pos.x)
				.attr("y",pos.y)
				.attr("width",dim.x)
				.attr("height",dim.y)
	}
	firstSlot(coursId){
		let s = this.slotDict[this.cellBackId(group.start)];
		return s[0];
	}
	isGroupConflict(group){
		return this.coursStackHeight(group) > 1;
	}
	coursStackHeight(group){
		let s = this.slotDict[this.cellBackId(group.start)];
		return dictLen(s)
	}
	getGroupColor(group){
		let s = this.slotDict[this.cellBackId(group.start)];
		let slots = Object.values(s);
		if(slots.length > 1)
			return DaViSettings.conflictColor
		return this.getColor(slots[0]);

	}
	appendCourseToDict(coursId){

		let newSlots = {}
		let updatedGroups = []
		let updatedItemIndex = {}
		let timetable =this;

		// Create a new group, put it in the timatable record andin the list of thing that need update
		function appendGroup(id,g){
			let groupOf = timetable.groups[id];
			if(!groupOf)
				groupOf = []
			groupOf.push(g)
			timetable.groups[id] = groupOf;

			updatedGroups.push(g)
		}
		// Create a new slot, put it in the timatable record andin the list of thing that need update
		function appendSlot(key,id,slot){
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

		function getConflicts(day, time){

			let conflictId = timetable.cellBackId(day,time);
			let conflictSlots = timetable.slotDict[conflictId]
			for(let confcours in conflictSlots){
				for(let g of timetable.groups[confcours]){
					if(g.start.x == day ){
						if(g.start.y <= time && g.start.y + g.height > time)
							return {coursId : confcours,group:g};
					}
				}
			}
		}

		// Find how many group need to be created to display the conflict properly and create them
		function resolveConflict(newCourseID,oldCoursId,groupOld,slotNew){

			if(!updatedItemIndex[groupOld.itemIndex]){
				updatedGroups.push(groupOld)
				updatedItemIndex[groupOld.itemIndex] = true;
			}

			if(timetable.coursStackHeight(groupOld) <= 2){
				let key = timetable.cellBackId(slotNew.day,slotNew.time)
				let slotOld = timetable.slotDict[key][oldCoursId];
				if(slotNew.time == groupOld.start.y && slotNew.time +1 === groupOld.start.y + groupOld.height){
					appendGroup(newCourseID,groupOld)
					return;
				}
				let conflictGroup = timetable.Group(slotOld)
				appendGroup(newCourseID,conflictGroup)
				appendGroup(oldCoursId,conflictGroup)
				if(slotNew.time == groupOld.start.y){
					groupOld.start = groupOld.start.plus(0,1);
					groupOld.height -= 1;
				}else if(slotNew.time +1 === groupOld.start.y + groupOld.height){
					groupOld.height -= 1;
				}else{
					let h0 = groupOld.height;
					groupOld.height = slotNew.time - groupOld.start.y;
					let t0 = slotNew.time +1;
					let key = timetable.cellBackId(slotNew.day,t0)
					let newGroup = timetable.Group(timetable.slotDict[key][oldCoursId])
					appendGroup(oldCoursId,newGroup)
					newGroup.height = h0 + groupOld.start.y - slotNew.time -1
				}
			}else{
				if(!timetable.groups[newCourseID])
					timetable.groups[newCourseID] = []
				timetable.groups[newCourseID].push(groupOld);
			}
		}
		function group(id,slot,color){

			let g = timetable.Group(slot)
			appendGroup(id,g)
			return g
		}
		function entry(id,slot){
			let key = timetable.cellBackId(slot.day,slot.time)
			appendSlot(key,id,slot)
		}
		let course = ISA_data[coursId];
		let groupedSlot = [];
		if(course.timeslots.length > 0){
			let sortedSlots = course.timeslots.slice().sort(ts => ts.day*100 + ts.time);
			sortedSlots.reverse();

			let lastGroup = ""
			let last = ""
			for(let slot of sortedSlots){

				let conflict = getConflicts(slot.day,slot.time);

				entry(coursId,slot)

				if(conflict){
					resolveConflict(coursId,conflict.coursId,conflict.group,slot)
				}
				else if(this.shouldGroup(coursId,last,coursId,slot)){
					lastGroup.height +=1;
					last = slot;
				}
				else{
					lastGroup = group(coursId,slot,this.getColor(slot))
					last = slot;
				}

			}

		}

		return {slotDict:newSlots,groups:updatedGroups}
	}

	// Text element are reused, so we keep track of thier id.
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

	// Cheeckif the location of two slots allow  grouping, for now we alway group by actvivty , bu if you use an alternative legend, 
	// for exmple with one color per course, you can change this.groupFunction
	shouldGroup(id1,s1,id2,s2){
		if(isUndef(s1) || isUndef(id1) ||isUndef(s2) ||isUndef(id2))
			throw new Error([s1,id1,s2,id2].join());
		return id1 === id2 && s1.day  === s2.day && s1.time+1  === s2.time && this[this.groupFunction](s1,s2)
	}
	// Return true if the two slot have the same activity 
	groupByActivity(a,b){
		return a.activity === b.activity 
	}

	//Initialise the time table. Creat all needed elements. Also used to resize the table(that is not optimal but is was the fastest to implement)
	initTimetable() {



		this.groupFunction = "groupByActivity";
		let figure = d3.select("#"+DaViSettings.timeTableId);
		let tableBody = d3.select("#"+DaViSettings.timeTableDivId);

		figure.selectAll("*").remove();
		figure.append("defs")
		let offset = DaViSettings.dayshoursDivOffset
		let cellMargin = DaViSettings.cellMargin;
		let tableBox = tableBody.node();

       	let parent =tableBody.parentElement
        let tableDim = new Vec(tableBox.clientWidth,tableBox.clientHeight).minus(30,30)
      
       
        DaViSettings.tableDim = tableDim
        DaViSettings.tableDimSmall = tableDim
        DaViSettings.tableDimBig = tableDim

	    this.cellDimWmargin = DaViSettings.tableDimSmall.minus(DaViSettings.dayshoursDivOffset).divide(DaViSettings.days.length,DaViSettings.dayEnd-DaViSettings.dayStart);
		this.cellDim = this.cellDimWmargin.minus(DaViSettings.cellMargin.time(2));

		this.tableAbsOrigin = offset.plus(tableBox.offsetLeft ,tableBox.offsetTop);
		
		//Create Shadows
		for(let day = 0;day<DaViSettings.days.length;day++){
			for (let hour = 0; hour < DaViSettings.dayEnd-DaViSettings.dayStart; hour++)
				figure.append("rect")
					.attr("x",this.cellDimWmargin.x * day + cellMargin.x + offset.x)
					.attr("y",this.cellDimWmargin.y * hour + cellMargin.y + offset.y )
					.attr("width",this.cellDim.x)
					.attr("height",this.cellDim.y)
					.attr("id",this.cellBackId(day,hour))
					.attr('fill',DaViSettings.cellDefaultColor)
					.classed("clickable",true)
					.on("click",()=>{
						window.courselist.showTopSpe(
							DaViSettings.days[day]+" "+(DaViSettings.dayStart + hour)+"H",
							"#F6630C",
							timeFilter(day,hour))
						}
					);
		}

		// Time labels
		for(let day = 0;day<DaViSettings.days.length;day++){
			let text = figure.append("text")
					.attr("x",this.cellDimWmargin.x * day + cellMargin.x + offset.x)
					.attr("y",0)
					.style('text-anchor', 'middle')
					.text(DaViSettings.days[day])
					.classed("clickable",true)
					.classed(DaViSettings.days[day],true)
					.on("click",()=>{
						window.courselist.showTopSpe(
							DaViSettings.days[day],
							"#F6630C",
							timeFilter(day,""))
						}
					);
			this.alignText(text,new Vec(this.cellDimWmargin.x * day + cellMargin.x + offset.x, 0).minus(this.tableAbsOrigin), new Vec(this.cellDimWmargin.x,offset.y),200)
		}
		for(let hour = DaViSettings.dayStart;hour <= DaViSettings.dayEnd;hour++){
			let posY = (hour - DaViSettings.dayStart) * this.cellDimWmargin.y + offset.y;
			figure.append("text")
				.attr("x",-80)
				.attr("y",posY)
				.text(hour+" _ ")
				.classed("clickable",true)
				.classed("H"+hour,true)
				.on("click",()=>{
						window.courselist.showTopSpe(
							hour+"H",
							"#F6630C",
							timeFilter("",hour-DaViSettings.dayStart))
						}
				)
				.transition()
				.duration(500)
				.attr("x",cellMargin.x)
				.ease(d3.easeCubicOut)

		}

		// Create divs that will display enabled courses
		for(let i = 0 ;i < DaViSettings.tableTextCount;i++){

			let txt = tableBody.append("div")
				.attr("id",DaViSettings.cellTextId+i)
				.classed(DaViSettings.cellTextClass,true)
				.style('border',"1px solid")

			this.resetCellText(DaViSettings.cellTextId+i)

		}


	}

	// Refresh a display div (or group) content and location, also update shadows under this group.
	updateGroup(group,enabling){
		let groupStart = group.start;
		let textDim = this.cellDim.time(1,group.height)
		let color = this.getGroupColor(group);
		let itemIndex = group.itemIndex
		function expand(grp,timetable){
			timetable.switchGroupExpand(grp);
		}
		let item = d3.select("#"+DaViSettings.cellTextId+itemIndex)
					.style("max-width",this.cellDim.x+"px")
		let textOnTheWay = this.fillText(item,groupStart,textDim,false,enabling)
			.on("click",()=>expand(group,this))
			.transition()
			.duration(DaViSettings.shortNoticeableDelay)
			.ease(d3.easeCubicOut)
			.style("width",this.cellDim.x+"px")
			.style('font-size',DaViSettings.cellFontDefault)
			.style("opacity",1)
			.style("background-color",color)
			.style('padding',null)
			.style('box-shadow',null)
			.style('border-color',d3.interpolateLab(color, "black")(0.15))
		this.alignText(textOnTheWay,groupStart.time(this.cellDimWmargin).plus(DaViSettings.cellMargin),textDim)

		for(let t = 0; t <group.height;t++){
			let key = this.cellBackId(group.start.x,group.start.y+t)
			this.updateGroupShadow(key,group,true)
		}
	}

	// Add add course in the schedul, mousepos is optional, it's used to make the dive pop from were the user clicked.
	addCourse(coursId,mousePos){
		if(this.groups[coursId])
			return
		let news = this.appendCourseToDict(coursId);
		let updatedGroups = news.groups
		let newSlots = news.slotDict
		let cellDim = this.cellDim;
		for(let groupId in updatedGroups){
			for(let group of updatedGroups){
				let isNew = group.itemIndex === -1
				if(isNew)
					group.itemIndex = this.takeTextId();


				if(!isUndef(mousePos)){
					d3.select("#"+DaViSettings.cellTextId+group.itemIndex).style("left" , mousePos.x+"px")
						.style("top" ,mousePos.y+"px")
				}
				this.updateGroup(group,true);
			}
		}

	}
	// Do the logical removal, update all tables and find all element that need to be changed.
	removeGroupFromSlots(groups,coursId){
		let updated = {};
		let removedTracker = {};
		let groupsToUpdate = [];
		let nameToUpdate = ""
		let groupToRemove= []
		function scheduleUpdate(ugr){
			if(!updated[ugr.itemIndex]){
				updated[ugr.itemIndex] = true;
				groupsToUpdate.push(ugr);
			}
		}
		function scheduleRemoval(rgr){
			if(!removedTracker[rgr.itemIndex]){
				removedTracker[rgr.itemIndex] = true;
				groupToRemove.push(rgr);
			}
		}
		for(let g of groups){
			if(!this.isGroupConflict(g)){
				scheduleRemoval(g)
				for(let i =0; i < g.height;i++){

					let key = this.cellBackId(g.start.x,g.start.y+i)
					let slots = this.slotDict[key]
					if(slots){
						delete this.slotDict[key][coursId];
					}
				}
			}
			else{
				let key = this.cellBackId(g.start.x,g.start.y)
				let confCount = dictLen(this.slotDict[key])
				delete this.slotDict[key][coursId];
				scheduleUpdate(g);
			}
		}

		//Handle the case if deletion of a conflict can allow new timeslot merging.
		for(let course in this.groups){
			if(course !== coursId){
				let sortg  = this.groups[course].slice().sort((a,b) => a.start.x*100 + a.start.y - (b.start.x*100 + b.start.y));
				for(let i = 1; i<sortg.length;i++){
					let g = sortg[i]
					let gPrev = sortg[i-1]
					let keyhere = this.cellBackId(g.start.x,g.start.y)
					let keyPrev = this.cellBackId(gPrev.start.x,gPrev.start.y + gPrev.height-1)
					if(dictLen(this.slotDict[keyhere]) === 1 && dictLen(this.slotDict[keyPrev]) ===1){
						let slotHere = this.slotDict[keyhere][course]
						let upper = this.slotDict[keyPrev][course]
						if(this.shouldGroup(course,upper,course,slotHere)){
							g.height += gPrev.height
							g.start = g.start.minus(0,gPrev.height);
							scheduleRemoval(gPrev);
							scheduleUpdate(g);
						}
					}

				}
			}

		}

		return {update:groupsToUpdate, removed:groupToRemove};

	}

	// Remove a course
	removeCourse(coursId,mousepos){

		let deletedGroups = this.groups[coursId]
		if(!deletedGroups)
			return

		let deletedSlots = this.slotDict[coursId]
		let changes = this.removeGroupFromSlots(deletedGroups,coursId);
		for(let deletedGroup of changes.removed){
			let oldGroupId = deletedGroup.itemIndex
			this.freeTextId(oldGroupId)
			this.resetCellText(DaViSettings.cellTextId + oldGroupId,DaViSettings.defaultDelay,mousepos)
			for(let i = deletedGroup.start.y; i < deletedGroup.start.y + deletedGroup.height;i++){
				let key = this.cellBackId(deletedGroup.start.x,i)
				this.setCellIsolated(key);
			}
			deletedGroup.itemIndex = -2;
		}
		for(let course in this.groups){
			this.groups[course] = this.groups[course].filter(g => g.itemIndex !== -2)
		}
		for(let change of changes.update){
			if(change.itemIndex>=0)
				this.updateGroup(change,coursId);
		}

		delete this.groups[coursId]


	}

	// Switch the display mod of a course div (big or small)
	switchGroupExpand(group){

		let itemIndex= group.itemIndex;
		let groupStart = group.start;
		function reset(g,timetable){
			let item = d3.select("#"+DaViSettings.cellTextId+g.itemIndex)

				if(item.attr("daviexpanded") && item.attr("daviexpanded") === "true"){
					item.style('padding',null)
						.style('box-shadow',null)
						.attr("daviexpanded",false)
						.style('z-index',null)
					timetable.updateGroup(g)
					let key = timetable.cellB
				}
		}
		for(let cours in this.groups){
			for(let g of this.groups[cours]){
				if(itemIndex !==  g.itemIndex)
					reset(g,this)
			}
		}


		let item = d3.select("#"+DaViSettings.cellTextId+itemIndex)
		if(!item.attr("daviexpanded") || item.attr("daviexpanded") === "false"){
			let t = this.fillText(item,groupStart,new Vec(10000,10000),true,true)
			t.attr("daviexpanded",true)
				.style("max-width",null)
				.style('z-index',2000)
				.style('box-shadow',"5px 10px 18px #888888")
				.transition()
				.duration(DaViSettings.defaultDelay)
				.ease(d3.easeCubicOut)
				.style('width',"auto")
				.style('height',"auto")
				.style('padding', "10px")
				.style('font-size',DaViSettings.cellFontDefault)
			for(let i = 0;i<group.height;i++){
				let key = this.cellBackId(group.start.x,group.start.y+i);
				d3.select("#"+key)
					.transition()
					.duration(DaViSettings.shortNoticeableDelay)
					.ease(d3.easeCubicOut)
					.style("fill","white");
			}
		}
		else
			reset(group,this)


	}

	// Create the text inside a course div from stored information, if isExepandedMode is false, 
	// this methode will addapte the content so that the div have a width and heigh of exactly maxDims
	// This methode just put content all in the div. If it don't fit it reduce the amount of display content and retry until everything fit.
	// If the content cannot reducedanymore, the font size will be reduced instead.
	fillText(parent,groupStart,maxDims,isExepandedMode,enabling){
		function isOk(dim){
			return dim.x <= maxDims.x + 1e-3 && dim.y < maxDims.y + 1e-3
		}
		function mkRoomLink(parent, room){
			parent.append("a")
				.text(room)
				.attr("href",DaViSettings.epflPlanQuerry+room)
				.classed(DaViSettings.roomLinkTextClass)
		}
		parent.style('font-size',DaViSettings.cellFontDefault)

		parent.html("")
		let text = parent.append("div")
			.classed(DaViSettings.detailDiv,true)

		let slots = this.slotDict[this.cellBackId(groupStart)]
		let allTitleName =[];
		let allCodes = [];

		let everythingFit = true
		let isFirst = true
		for(let coursId in slots){
			let slot = slots[coursId]
			let course = ISA_data[coursId]
			allTitleName.push(coursId)
			allCodes.push(course.code)
			if(everythingFit){
				if(!isFirst)
					text.append("hr")
					.attr("noshade","noshade")
					.style("background-color","red")
					.style("color","darkred")
				let detailsDiv = text.append("div")
				if(isExepandedMode){
					let color = this.getColor(slot)
					let temp = detailsDiv.transition()
						.ease(d3.easeCubicOut)
						.duration(DaViSettings.defaultDelay)
						.style("background-color",color)
					if(dictLen(slots)>1)
						temp.style("padding","2px")
						.style("border","2px solid")
						.style("border-color",d3.interpolateLab(color, "black")(0.5))
				}
				detailsDiv.append("a")
					.text(coursId+" ("+course.code+")")
					.classed(DaViSettings.cellTitleTextClass,true)
				let rooms = slot.room
				if(isExepandedMode){
					let stuffDiv = detailsDiv.append("div")
					stuffDiv.append('div')
						.text('👁')
						.classed("left",true)
						.on("click",()=>{
							d3.event.stopPropagation();
							courselist.showDetails(coursId, course);
							d3.select("#courseInfo")
							.style('background-color',"rebeccapurple")
							.transition()
							.duration(DaViSettings.shortNoticeableDelay)
							.ease(d3.easeCubicOut)
							.style('background-color',"white");
						})
					stuffDiv.append('div')
						.text('❌')
						.classed("right",true)
						.on("click",() => {courselist.enableCourse(coursId, d3.event)})
					let roomsDiv = stuffDiv.append("div")
						.classed("center",true);
					mkRoomLink(roomsDiv,rooms[0])
					for(let i =1;i<rooms.length;i++){
						roomsDiv.append("span")
							.txt(",")
						mkRoomLink(roomsDiv,rooms[i]);
					}

				}else{
					let roomsDiv = detailsDiv.append("div")
					mkRoomLink(roomsDiv,rooms[0])
					for(let i =1;i<rooms.length;i++){
						roomsDiv.append("span")
							.txt(",")
						mkRoomLink(roomsDiv,rooms[i]);
					}
				}
				everythingFit = isOk(Vec.Dim(text.node().getBoundingClientRect()))
				isFirst = false
			}
		}

		if(!everythingFit){
			text.html("");
			isFirst = true
			for(let coursId in slots){
				if(!everythingFit)
					break;

				let slot = slots[coursId]
				let course = ISA_data[coursId]

				if(!isFirst)
					text.append("hr")
				let detailsDiv = text.append("div")
				detailsDiv.append("a")
					.text(coursId)
					.classed(DaViSettings.cellTitleTextClass,true)
				let rooms = slot.room
				let roomsDiv = text.append("div")
				mkRoomLink(roomsDiv,rooms[0])
				for(let i =1;i<rooms.length;i++){
					roomsDiv.append("spand")
						.txt(",")
					mkRoomLink(roomsDiv,rooms[i]);
				}
				isFirst = false
				everythingFit = isOk(Vec.Dim(text.node().getBoundingClientRect()))
			}
		}

		if(!everythingFit){
			let dictKeys = Object.keys(slots);
			if(dictKeys.length ==1){
				let size =0.9;
				text.html("");
				let nSpan = text.append("span")
					.text(dictKeys[0])
				for(let i =0;i<6 && !everythingFit;i++){
					nSpan.style('font-size',size+"em")
					size *= 0.9;
					everythingFit = isOk(Vec.Dim(text.node().getBoundingClientRect()))
				}
			}
		}
		if(!everythingFit){
			text.html("");
			isFirst = true
			for(let coursId in slots){

				if(!everythingFit)
					break;
				let slot = slots[coursId]
				let course = ISA_data[coursId]
				if(!isFirst)
					text.append("hr")
				let detailsDiv = text.append("div")
				detailsDiv.append("a")
					.text(course.code)
					.classed(DaViSettings.cellTitleTextClass,true)
				let rooms = slot.room
				let roomsDiv = text.append("div")
				mkRoomLink(roomsDiv,rooms[0])
				for(let i =1;i<rooms.length;i++){
					roomsDiv.append("span")
						.txt(",")
					mkRoomLink(roomsDiv,rooms[i]);
				}
				isFirst = false
				everythingFit = isOk(Vec.Dim(text.node().getBoundingClientRect()))


			}
		}
		if(!everythingFit){
			text.html("");
			text.classed(DaViSettings.cellTitleTextClass,true)
			text.text(allTitleName.join(" / "))
			everythingFit = isOk(Vec.Dim(text.node().getBoundingClientRect()))

		}
		if(!everythingFit){
			let titleDims = Vec.Dim(text.node().getBoundingClientRect())
			text.text(allCodes.join(" / "))
			everythingFit = isOk(Vec.Dim(text.node().getBoundingClientRect()))
			while(allCodes.length > 1 && !everythingFit){
				allCodes.pop()
				let otherCount = allTitleName.length - allCodes.length
				if(otherCount == 1)
					otherCount += " other"
				else
					otherCount += " others"
				text.text(allCodes.join(" / ")+" and "+otherCount)
				everythingFit = isOk(Vec.Dim(text.node().getBoundingClientRect()))
			}
			let fontSize = 1;
			while(!everythingFit){
				fontSize*=0.9;
				text.style('font-size',fontSize+"em")
				everythingFit = isOk(Vec.Dim(text.node().getBoundingClientRect()))
			}
		}
		if(enabling)
			parent = parent.style('font-size',DaViSettings.cellFontVerySmall)

		return parent;

	}
	
	// return data for the start plot, not used but could help
	// It's here because the record kept by timetable are the most addapted to do this task.
	getDetailledDailyWorkload(){
		let cumulativeworkloads = {}
		DaViSettings.activities.forEach(a=>{
			cumulativeworkloads[a] = Array.apply(null, Array(DaViSettings.workdays.length)).map(()=>0);
		})
		cumulativeworkloads["conflict"] = Array.apply(null, Array(DaViSettings.workdays.length)).map(()=>0);
		for(let day = 0; day<DaViSettings.workdays.length;day++){
			for(let hour = 0;hour<DaViSettings.dayEnd-DaViSettings.dayStart;hour++){
				let key = this.cellBackId(day,hour)
				let slot = this.slotDict[key];
				if(slot){
					let vals = Object.values(slot);
					if(vals.length >1)
						cumulativeworkloads["conflict"][day]++;
					else if(vals.length){
						cumulativeworkloads[vals[0].activity][day]++;
					}
				}
			}
		}
		return cumulativeworkloads;
	}

	// Callback function when thing are resize. For the moment this methode recreate every composent of the time table.
	resize(){

		this.groupFunction = "groupByActivity";
		let figure = d3.select("#"+DaViSettings.timeTableId);
		let tableBody = d3.select("#"+DaViSettings.timeTableDivId);
		let offset = DaViSettings.dayshoursDivOffset
		let cellMargin = DaViSettings.cellMargin;
		let tableBox = tableBody.node();

       	let parent =tableBody.parentElement
        let tableDim = new Vec(tableBox.clientWidth,tableBox.clientHeight).minus(30,30)
      
       
        DaViSettings.tableDim = tableDim
        DaViSettings.tableDimSmall = tableDim
        DaViSettings.tableDimBig = tableDim

	    this.cellDimWmargin = DaViSettings.tableDimSmall.minus(DaViSettings.dayshoursDivOffset).divide(DaViSettings.days.length,DaViSettings.dayEnd-DaViSettings.dayStart);
		this.cellDim = this.cellDimWmargin.minus(DaViSettings.cellMargin.time(2));

		this.tableAbsOrigin = offset.plus(tableBox.offsetLeft ,tableBox.offsetTop);

		for(let day = 0;day<DaViSettings.days.length;day++){
			for (let hour = 0; hour < DaViSettings.dayEnd-DaViSettings.dayStart; hour++){
				let key = timtable.cellBackId(day,hour);
				timtable.setCellIsolated(key)
			}
		}
		for(let day = 0;day<DaViSettings.days.length;day++){
			let text = d3.select("."+DaViSettings.days[day])
			this.alignText(text,new Vec(this.cellDimWmargin.x * day + cellMargin.x + offset.x, 0).minus(this.tableAbsOrigin), new Vec(this.cellDimWmargin.x,offset.y),200)
		}
		for (let cours in timtable.groups){
			for(let g of timtable.groups[cours])
				timtable.updateGroup(g)
		}
		for(let hour = DaViSettings.dayStart;hour <= DaViSettings.dayEnd;hour++){
			let posY = (hour - DaViSettings.dayStart) * this.cellDimWmargin.y + offset.y;
			d3.select(".H"+hour)
				.transition()
				.duration(500)
				.attr("x",cellMargin.x)
				.attr("y",posY)
				.ease(d3.easeCubicOut)

		}
	}
}

// Timetable is a var as its a convinient way to allow coomunication between our composent. 
// If the project scale that may need to be changed.
var timtable = new TimeTable()
d3.select("#tableDiv").on("resize",()=>timtable.resize())


