// Builds a map from an Object
function buildMap(obj) {
    let map = [];
    Object.keys(obj).forEach(key => {
        map.push([key, obj[key]]);
    });
    return map;
}

//Checks if an Object is Iterable
function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

// Creates the activity metadata for a specific course
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

// Gets the season exam and its type from the given metadata
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

  //Constructor of the class
  constructor() {
    this.enableCourseList = [];
    this.coursesInList = [];
    this.conflictList = new Map();
    this.hoverTimout = "";
    this.topSpe = "";
  }

  // Creates the course list itself
  createCourseList(data) {

    // Checks if a course is mandatory
    function isObl(c){
      if(DaViSettings.userSection === "IN")
        return c.mandatory_I
      return c.mandatory_C
    }

    // Sorts by mandatory courses
    function copareCourses(a,b){
      if(isObl(a[1])){
        if(!isObl(b[1]))
          return -1
      }else if(isObl(b[1]))
        return 1;
        return a[0]>b[0];
    }

    // Starts the creation of the div
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
    let i = 0
    // For each course we create a cell with all the information inside
    for(let [course, metadata] of data) {
      let row = document.createElement("tr");
      row.className = DaViSettings.courseListRowClass;
      tbody.appendChild(row);

      let courseName = document.createElement("td");
      row.appendChild(courseName)

      let hover = document.createElement("div");
      hover.id = this.getId(course) + "_button";
      hover.style.background =  "#f6f6f6"
      hover.className = DaViSettings.tooltipClass;
      hover.innerHTML = ""
      // If the course is mandatory add a diamond
      if(isObl(metadata))
        hover.innerHTML += "🔸 "
      hover.innerHTML += course;
      let speSpan = document.createElement("span");
      let speSpanClasses  = ["speSpanClass0"].concat(metadata.specialisations[DaViSettings.userSection].map(x =>"speSpanClass"+x));
      speSpan.className = speSpanClasses.join(" ");
      hover.appendChild(speSpan);
      courseName.appendChild(hover)

      // Creates the tooltip
      let hoverInside = document.createElement("div");
      hoverInside.className = DaViSettings.tooltipTextClass;
      hoverInside.id = "Fixme2"+i
      hover.appendChild(hoverInside)

      d3.select("#"+hoverInside.id)
        .append("span")
        .text(course)
        .classed("tooltipTitle",true)

      var activities = createActivityData(metadata);

      var inside = d3.select("#"+hoverInside.id)
                      .append("div")

      // Creates the chart inside the hover
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

  // Function called when an element of the list is clicked
  enableCourse(c, event) {
    let cid = this.getId(c)
    // If the course is already clicked it removes it from the chosen list
    if(this.coursesInList.includes(c)) {
      var index = this.coursesInList.indexOf(c);
      if (index > -1) {
        this.enableCourseList.splice(index, 1);
        this.coursesInList.splice(index, 1);
        timtable.removeCourse(c, new Vec(event.clientX, event.clientY));
        var wasOrange = false;
        // For all of the conflicts modify the color
        for(let conflict of this.conflictList.get(c)) {
          let confid = this.getId(conflict)
          // If a conflict was chosen, remove the orange color coming from the removed element
          if(document.getElementById(confid+"_button").style.backgroundColor === "orange"||document.getElementById(confid+"_button").style.backgroundColor === "rgb(0, 171, 120)") {
            document.getElementById(confid+"_button").style.backgroundColor = "rgb(0, 171, 120)";
            wasOrange = true;
          } else {
            // If the conflict was not chosen (it was red) set it to default unchosen color
            document.getElementById(confid+"_button").style.backgroundColor = "#f6f6f6"
          }
        }
        if(wasOrange) {
          // Still is in conflict with a current course, keep it red
          document.getElementById(cid+"_button").style.backgroundColor = DaViSettings.conflictColor;
        } else {
          // No conflict becomes white
          document.getElementById(cid+"_button").style.backgroundColor = "#f6f6f6"
        }
      }
    } else {
        // If the course was not already chosen we add it to the list
        this.enableCourseList.push(c)
        this.coursesInList.push(c)
        timtable.addCourse(c, new Vec(event.clientX, event.clientY));
        var wasGreen = false;
        // Checks color of conflicting courses
        for(let conflict of this.conflictList.get(c)) {
          let confid = this.getId(conflict)
          // If a conflict was already chosen the conflict becomes orange
          if(document.getElementById(confid+"_button").style.backgroundColor === "rgb(0, 171, 120)" || document.getElementById(confid+"_button").style.backgroundColor === "orange") {
            document.getElementById(confid+"_button").style.backgroundColor = "orange";
            wasGreen = true;
          } else {
            // If not set them to red
            document.getElementById(confid+"_button").style.backgroundColor = DaViSettings.conflictColor
          }
        }
        if(wasGreen) {
          // If a conflict was already chosen the chosen course becomes orange
          document.getElementById(cid+"_button").style.backgroundColor = "orange";
        } else {
          // If not it becomes 'green'
          document.getElementById(cid+"_button").style.backgroundColor = "rgb(0, 171, 120)";
        }
    }
    // Check all the conflicts and update their colors if it was not done before
    for(let conf of this.enableCourseList) {
      var goesOrange = false;
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

  // Shows the top specialization first in its div
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

  // Creates the conflict map
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

  // Shows the description details of the course selected
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
  // Gets the ids
  getId(s){
    return s.replace(/[^\w]/g,"")
  }
}

// Initiates the class
var courselist = new CourseList()
// Creates a map with the data scrapped
let data_map = buildMap(ISA_data);
// Creates the course list
courselist.createCourseList(data_map)
// Creates the conflict map
courselist.conflicts(data_map
// For each element of the list we create the button and hover functions
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
