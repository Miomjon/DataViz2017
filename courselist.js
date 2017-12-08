function buildMap(obj) {
    let map = new Map();
    Object.keys(obj).forEach(key => {
        map.set(key, obj[key]);
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
  var activities = [0,0,0];
  for(let times of metadata.timeslots) {
    activities[times.activity%96] += 1
  }
  return activities;
}

class CourseList {

	constructor() {
		this.enableCourseList = [];
    this.coursesInList = [];
    this.conflictList = new Map();
	}

	createCourseList(data) {

		let table = document.getElementById(DaViSettings.courseListId);

		let tbody = document.createElement("tbody");
		let titlerow =  document.createElement("tr");
		let cell = document.createElement("th");
		cell.innerHTML = "Courses";

		titlerow.appendChild(cell)
		tbody.appendChild(titlerow)

		for(let [course, metadata] of data) {

			let row = document.createElement("tr");
			row.className = DaViSettings.courseListRowClass;

			let courseName = document.createElement("td");
			// courseName.innerHTML = course;

      // courseName.className = DaViSettings.cellCourseRow;

      let hover = document.createElement("div");
      hover.id = course + "_button";
      hover.style.background =  "#f6f6f6"
      hover.className = DaViSettings.tooltipClass;
      hover.innerHTML = course;

      let hoverInside = document.createElement("span");
      hoverInside.className = DaViSettings.tooltipTextClass;
      hoverInside.innerHTML = course

      let charT = document.createElement("div");
      charT.className = DaViSettings.chartClass;

      var activities = createActivityData(metadata);
      var datas = [1, 2, 3]
      let firstDiv = document.createElement("div");
      firstDiv.id = "firstId";
      firstDiv.className = DaViSettings.chartClass;
      d3.select("#firstId")
          .data(datas)
          .style("height", function(d) { return d*10 + "px"; })
          .text(function(d) { return d; });

      let secondDiv = document.createElement("div");
      secondDiv.id = "secondId";
      // d3.select("#secondId")
      //     .data(activities[1])
      //     .style("width", function(e) { return (e-10)*10 + "px"; })
      //     .text(function(e) { return e; });

      let thirdDiv = document.createElement("div");
      thirdDiv.id = "thirdId";
      // d3.select("#thirdId")
      //     .data(activities[2])
      //     .style("width", function(d) { return d*10 + "px"; })
      //     .text(function(d) { return d; });

      charT.appendChild(firstDiv);
      charT.appendChild(secondDiv);
      charT.appendChild(thirdDiv);

      hoverInside.appendChild(charT);
      hover.appendChild(hoverInside)
      courseName.appendChild(hover)
			row.appendChild(courseName)
			tbody.appendChild(row);
		}

		table.appendChild(tbody);
	}

	enableCourse(c) {
		if(this.coursesInList.includes(c)) {
			var index = this.coursesInList.indexOf(c);
			if (index > -1) {
    		this.enableCourseList.splice(index, 1);
        this.coursesInList.splice(index, 1);
        timtable.removeCourse(c, new Vec(event.clientX, event.clientY));
        var wasOrange = false;
        for(let conflict of this.conflictList.get(c)) {
          if(document.getElementById(conflict+"_button").style.background === "orange"||document.getElementById(conflict+"_button").style.background === "green") {
            document.getElementById(conflict+"_button").style.background = "green";
            wasOrange = true;
          } else {
            document.getElementById(conflict+"_button").style.background = "#f6f6f6"
          }
        }
        if(wasOrange) {
          document.getElementById(c+"_button").style.background = "red";
        } else {
          document.getElementById(c+"_button").style.background = "#f6f6f6"
        }
      }
		} else {
				this.enableCourseList.push(c)
        this.coursesInList.push(c)
        timtable.addCourse(c, new Vec(event.clientX, event.clientY));
        var wasGreen = false;
        for(let conflict of this.conflictList.get(c)) {
          if(document.getElementById(conflict+"_button").style.background === "green" || document.getElementById(conflict+"_button").style.background === "orange") {
            document.getElementById(conflict+"_button").style.background = "orange";
            wasGreen = true;
          } else {
            document.getElementById(conflict+"_button").style.background = "red"
          }
        }
        if(wasGreen) {
          document.getElementById(c+"_button").style.background = "orange";
        } else {
          document.getElementById(c+"_button").style.background = "green";
        }
		}
    for(let conf of this.enableCourseList) {
      var goesOrange = false;
      if(isIterable(conf)) {
        // console.log(Array.from(this.conflictList.get(conf)))
        for(let list of this.conflictList.get(conf)) {
          if(document.getElementById(list+"_button").style.background === "green" || document.getElementById(list+"_button").style.background === "orange") {
            document.getElementById(list+"_button").style.background = "orange";
            goesOrange = true;
          } else {
            document.getElementById(list+"_button").style.background = "red"
          }
        }
        if(goesOrange) {
          document.getElementById(conf+"_button").style.background = "orange"
        } else {
          document.getElementById(conf+"_button").style.background = "green"
        }
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

  showConflicts(course) {
    var old = document.getElementById("courseInfo").children;
    var length = old.length;
    for(var i = 0; i < length; i++) {
      old[0].parentNode.removeChild(old[0]);
    }
    for(let conflict of this.conflictList.get(course)) {
      let con = document.createElement("div");
      con.innerHTML = conflict;
      document.getElementById("courseInfo").appendChild(con);
    }
  }

}


let courselist = new CourseList()
let data_map = buildMap(ISA_data);
courselist.createCourseList(data_map)
courselist.conflicts(data_map)
for(let [course, metadata] of data_map) {
	document.getElementById(course+"_button").onclick = () => courselist.enableCourse(course, event);
  document.getElementById(course+"_button").onmouseover = function(){courselist.showConflicts(course)}
}
//var courseList = new courseList();
//courseList.createTimetable(ISA_data);
