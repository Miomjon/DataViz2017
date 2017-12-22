function buildMap(obj) {
    let map = [];
    Object.keys(obj).forEach(key => {
        map.push([key, obj[key]]);
    });
    return map;
}

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

function createActivityData(metadata) {
  var activities = [0,0,0,0];
  for(let times of metadata.timeslots) {
    activities[times.activity%95] += 1
  }
  var datActivity = [];
  for(var i = 0; i < activities.length; i++) {
    var temp = {
      "duration": activities[i],
      "activity": i
    }
    datActivity.push(temp);
  }
  return datActivity;
}

function getSeason(exam_time, exam_type) {
  if(exam_time === "Winter") {
    if(exam_type === "During the semester") {
      return "🍁"
    }
    return "❄️";
  }
  if(exam_type === "During the semester") {
    return "🌼"
  }
  return "☀️";
}

class CourseList {

  constructor() {
    this.enableCourseList = [];
    this.coursesInList = [];
    this.conflictList = new Map();
    this.hoverTimout = "";
    this.topSpe = "";
  }

  createCourseList(data) {
    function isObl(c){
      if(DaViSettings.userSection === "IN")
        return c.mandatory_I
      return c.mandatory_C
    }
    function copareCourses(a,b){
      if(isObl(a[1])){
        if(!isObl(b[1]))
          return -1
      }else if(isObl(b[1]))
        return 1;
        return a[0]>b[0];
    }
    let table = document.getElementById(DaViSettings.courseListId);

    let tbody = document.createElement("tbody");
    table.appendChild(tbody);

    let titlerow =  document.createElement("tr");
    let cell = document.createElement("th");
    cell.innerHTML = "Courses";
    cell.className = "detailsTile"

    titlerow.appendChild(cell)
    tbody.appendChild(titlerow)
    data.sort(copareCourses)
    let i =0
    for(let [course, metadata] of data) {
      let row = document.createElement("tr");
      row.className = DaViSettings.courseListRowClass;
      tbody.appendChild(row);

      let courseName = document.createElement("td");
      row.appendChild(courseName)
      // courseName.innerHTML = course;

      // courseName.className = DaViSettings.cellCourseRow;

      let hover = document.createElement("div");
      hover.id = this.getId(course) + "_button";
      hover.style.background =  "#f6f6f6"
      hover.className = DaViSettings.tooltipClass;
      hover.innerHTML = ""
      if(isObl(metadata))
        hover.innerHTML += "🔸 "
      hover.innerHTML += course;
      let speSpan = document.createElement("span");
      let speSpanClasses  = ["speSpanClass0"].concat(metadata.specialisations[DaViSettings.userSection].map(x =>"speSpanClass"+x));
      speSpan.className = speSpanClasses.join(" ");
      hover.appendChild(speSpan);
      courseName.appendChild(hover)

      let hoverInside = document.createElement("div");
      hoverInside.className = DaViSettings.tooltipTextClass;
      // hoverInside.innerHTML = course
      hoverInside.id = "Fixme2"+i
      hover.appendChild(hoverInside)

      d3.select("#"+hoverInside.id)
        .append("span")
        .text(course)
        .classed("tooltipTitle",true)

      var activities = createActivityData(metadata);

      var inside = d3.select("#"+hoverInside.id)
                      .append("div")

      inside.append("div")
          .style("float", "left")
          .selectAll('div')
          .data(activities.filter(d=>d.duration>0)).enter()
          .append('div')
          .text(function(d) { return d.duration; })
          .style("background", d => DaViSettings.cellColorMap[d.activity])
          .style("color", "#333333")
          .style("font-weight","bold")
          .style("font-size","14px")
          .style("width", "15px")
          .style("height", function(d) { return d.duration*15 + "px"; });

      inside.append("div")
             .text("Credits: ")
             .append("b")
             .text(metadata.credits)

      //exam type/block/
      var season = getSeason(metadata.exam_time, metadata.exam_type)
      inside.append("div")
              .text("Exam : "+metadata.exam_type+" " + season);
      let teach = "Teacher"
      let coursteach = metadata.teachers
      if(coursteach.indexOf(",") >0)
        teach+="s"

      inside.append("div").text(teach+": ").append("b").text(coursteach);
      i ++;
    }
  }

  enableCourse(c, event) {
    let cid = this.getId(c)
    if(this.coursesInList.includes(c)) {
      var index = this.coursesInList.indexOf(c);
      if (index > -1) {
        this.enableCourseList.splice(index, 1);
        this.coursesInList.splice(index, 1);
        timtable.removeCourse(c, new Vec(event.clientX, event.clientY));
        var wasOrange = false;
        for(let conflict of this.conflictList.get(c)) {
          let confid = this.getId(conflict)
          if(document.getElementById(confid+"_button").style.backgroundColor === "orange"||document.getElementById(confid+"_button").style.backgroundColor === "rgb(0, 171, 120)") {
            document.getElementById(confid+"_button").style.backgroundColor = "rgb(0, 171, 120)";
            wasOrange = true;
          } else {
            document.getElementById(confid+"_button").style.backgroundColor = "#f6f6f6"
          }
        }
        if(wasOrange) {
          document.getElementById(cid+"_button").style.backgroundColor = DaViSettings.conflictColor;
        } else {
          document.getElementById(cid+"_button").style.backgroundColor = "#f6f6f6"
        }
      }
    } else {
        this.enableCourseList.push(c)
        this.coursesInList.push(c)
        timtable.addCourse(c, new Vec(event.clientX, event.clientY));
        var wasGreen = false;
        for(let conflict of this.conflictList.get(c)) {
          let confid = this.getId(conflict)
          if(document.getElementById(confid+"_button").style.backgroundColor === "rgb(0, 171, 120)" || document.getElementById(confid+"_button").style.backgroundColor === "orange") {
            document.getElementById(confid+"_button").style.backgroundColor = "orange";
            wasGreen = true;
          } else {
            document.getElementById(confid+"_button").style.backgroundColor = DaViSettings.conflictColor
          }
        }
        if(wasGreen) {
          document.getElementById(cid+"_button").style.backgroundColor = "orange";
        } else {
          document.getElementById(cid+"_button").style.backgroundColor = "rgb(0, 171, 120)";
        }
    }
    for(let conf of this.enableCourseList) {
      var goesOrange = false;
      // console.log(Array.from(this.conflictList.get(conf)))
      let confid = this.getId(conf)
      for(let list of this.conflictList.get(conf)) {
        let listid = this.getId(list)
        if(document.getElementById(listid+"_button").style.backgroundColor === "rgb(0, 171, 120)" || document.getElementById(listid+"_button").style.backgroundColor === "orange") {
          document.getElementById(listid+"_button").style.backgroundColor = "orange";
          goesOrange = true;
        } else {
          document.getElementById(listid+"_button").style.backgroundColor = DaViSettings.conflictColor
        }
      }
      if(goesOrange) {
        document.getElementById(confid+"_button").style.backgroundColor = "orange"
      } else {
        document.getElementById(confid+"_button").style.backgroundColor = "rgb(0, 171, 120)"
      }

    }
    insightsHandle.update(this.enableCourseList);

    if(this.topSpe.indexOf("hour")>-1){
      insightsHandle.onLegenClicked(98,'conflict','#67706F')
    }

  }

  showTopSpe(speLetter,speColor,filter){
    if(this.topSpe !== speLetter){
      this.topSpe = speLetter;
      let bColor = d3.interpolateLab(speColor, "black")(0.15)
      let textColor = "black";
      let c = d3.rgb(speColor);
      let a = ( 0.299 * c.r + 0.587 * c.g+ 0.114 * c.b)/255;
      if(a<0.5)
        textColor = "white";
      d3.selectAll(".speSpanClass0")
        .text("")
        .transition()
        .duration(DaViSettings.shortNoticeableDelay)
        .ease(d3.easeQuad)
        .style("border",null)
        .style("background-color",null)
        .style("border-color",null);
      if(filter){
        for(let c in ISA_data){
          let a = filter(ISA_data[c],c)
          if(a){
            if(!speLetter ){
              this.topSpe = a;
            }
            let cid = this.getId(c)
            d3.select("#"+cid+"_button").select(".speSpanClass0")
              .text(this.topSpe)
              .transition()
              .duration(DaViSettings.shortNoticeableDelay)
              .ease(d3.easeQuad)
              .style("border","1px solid")
              .style("background-color",speColor)
              .style("border-color",bColor)
              .style("color",textColor);
          }

        }

      }else{
        d3.selectAll(".speSpanClass"+speLetter)
        .text(speLetter)
        .transition()
        .duration(DaViSettings.shortNoticeableDelay)
        .ease(d3.easeQuad)
        .style("border","1px solid")
        .style("background-color",speColor)
        .style("border-color",bColor)
        .style("color",textColor);
      }

    }

  }
// remove and do a function that precomputes the conflicts for each course
  conflicts(data) {
    for(let [course, metadata] of data) {
      var list = [];
      for(let [otherCourse, otherMetadata] of data) {
        if(course !== otherCourse) {
          for(let timeslot of metadata.timeslots) {
            for(let otherTimeslot of otherMetadata.timeslots) {
              if(timeslot.day === otherTimeslot.day && timeslot.time === otherTimeslot.time) {
                list.push(otherCourse);
              }
            }
          }
        }
      }
      var uniqueList = list.filter(function(item, pos, self) {
          return self.indexOf(item) == pos;
      })
      this.conflictList.set(course, uniqueList);
    }
  }

  showDetails(course, metadata) {

    var details = d3.select("#courseInfo")
                    .html("")

    details.style("padding-left", "5px")

    details.append("span").text(course).classed("detailsTile",true)


    var descr = details.append("div")
      .classed("descriptions", true)

    let descrSub = descr.append("div")
    if(DaViSettings.userSection == "IN" && metadata.mandatory_I || DaViSettings.userSection == "SC" && metadata.mandatory_C)
      descrSub.append("div")
        .text("🔸 Mandatory group")
    let spes = metadata.specialisations[DaViSettings.userSection]
    if(spes.length){

      let infoDivText = "Specialisation"
      if(spes.length>1)
        infoDivText +="s"
      infoDivText+= ": "
      let spediv = descrSub.append("div")
        .style("padding-top","0.5em")
        .style("padding-bottom","0.5em")
      spediv.append("span")
        .text(infoDivText)
      spediv.selectAll("span.speSpanClass").data(spes).enter()
        .append("span")
        .text(d=>d)
        .classed("speSpanClass",true)
        .style("border","1px solid")
        .style("background-color",d=>insightsHandle.speColor(d))
        .style("border-color",d=>d3.interpolateLab(insightsHandle.speColor(d), "black")(0.15))
        .style("color",d=>{
          let c = d3.rgb(insightsHandle.speColor(d));
          let a = ( 0.299 * c.r + 0.587 * c.g+ 0.114 * c.b)/255;
          if(a<0.5)
            return "white"
          return "black"
        })
        .classed("clickable",true)
        .on("click",d => this.showTopSpe(d,insightsHandle.speColor(d)))
        .exit();
    }

    descrSub.append("div")
        .text("\n"+metadata.summary)


  }
  getId(s){
    return s.replace(/[^\w]/g,"")
  }
}


var courselist = new CourseList()
let data_map = buildMap(ISA_data);
courselist.createCourseList(data_map)
courselist.conflicts(data_map)
for(let [course, metadata] of data_map) {
  let coursid = courselist.getId(course)
  document.getElementById(coursid+"_button").onclick = (event) => courselist.enableCourse(course, event);
  document.getElementById(coursid+"_button").onmouseover = function(){
    if(courselist.hoverTimout){
      window.clearTimeout(courselist.hoverTimout);
      courselist.hoverTimout = "";
    }
    courselist.hoverTimout = window.setTimeout(()=>courselist.showDetails(course, metadata),DaViSettings.HoverTimout)
  }
  document.getElementById(coursid+"_button").onmouseout = function(){
    if(courselist.hoverTimout){
      window.clearTimeout(courselist.hoverTimout);
      courselist.hoverTimout = "";
    }
  }
}
