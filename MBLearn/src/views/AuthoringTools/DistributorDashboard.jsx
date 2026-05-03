import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axiosClient from "MBLearn/src/axios-client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookBookmark, faBookmark, faBoxArchive, faSearch } from "@fortawesome/free-solid-svg-icons";

import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import { useDivisionCourses } from "MBLearn/src/contexts/DivisionCoursesContext";
import { useAuthoringTool } from "MBLearn/src/contexts/AuthoringToolContext";

import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { CategoryCourseSelection } from "./CategoryCourseSelection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "MBLearn/src/components/ui/select";

export function DistributorDashboard() {
  const { setPageTitle } = useStateContext();
  const { setDivision } = useDivisionCourses();
  const { department, career_level } = useAuthoringTool();
  const [level, setLevel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [whatDivision, setWhatDivision] = useState("0");
  const [divisions, setDivisions] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const [distributionStatus, setDistributionStatus] = useState({
    published: 0,
    distributed: 0,
  });

  const [categoryData, setCategoryData] = useState([]); // contains { id, category_name, courses: [] }
  const [filteredCourses, setFilteredCourses] = useState([]);

  const displayedCourses = filteredCourses.filter(course => {
    if (level && level !== "all" && course.career_level?.name !== level) return false;
    if (searchTerm && !course.CourseName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const navigate = useNavigate();

  useEffect(() => {
    setPageTitle("CONTENT DASHBOARD");
  }, [setPageTitle]);

  useEffect(() => {
    if (department) {
      getDivisions(whatDivision);
    }
  }, [whatDivision, department]);

  useEffect(() => {
    getCourseDistributionStatus();
    getAllPublishedCourses();
  }, []);

  const getDivisions = (department_id) => {
    if (!department_id) return;
    axiosClient
      .get(`/getDivisionsByDepartment/${department_id}`)
      .then(({ data }) => {
        setDivisions(data);
      })
      .catch((err) => {
        console.error("Error fetching divisions:", err);
      });
  };

  const getCourseDistributionStatus = () => {
    axiosClient
      .get("/getCourseDistributionStatus")
      .then(({ data }) => {
        setDistributionStatus({
          published: data.published.length,
          distributed: data.distributed.length,
        });
      })
      .catch((error) => {
        console.error("Error fetching distribution status:", error);
      });
  };

    const getAllPublishedCourses = () => {
        axiosClient.get("/fetchAllDistributedCourses")
        .then(({ data }) => {
            console.log("Fetched published courses:", data);

            setFilteredCourses(data || []);
            const categoriesMap = (data || []).reduce((acc, course) => {
                const cat = course.category;
                if (cat) {
                if (!acc[cat.id]) {
                    acc[cat.id] = { 
                    id: cat.id, 
                    category_name: cat.category_name, 
                    courses: [] 
                    };
                }
                acc[cat.id].courses.push(course);
                }
                return acc;
            }, {});

            setCategoryData(Object.values(categoriesMap));
            
            setSelectedCategoryId(null);
        })
        .catch((error) => {
            console.error("Error fetching published courses:", error);
        });
    };

  const handleCategoryClick = (id) => {
    setSelectedCategoryId(id);
    const category = categoryData.find((cat) => cat.id === id);

    if (category) {
      setFilteredCourses(category.courses);
    } else {
      const allCourses = categoryData.flatMap((cat) => cat.courses);
      setFilteredCourses(allCourses);
      setSelectedCategoryId(null);
    }
  };

  /// --------------------
  /// Filter by Training Level
  /// --------------------
  const filteredCategoryData = categoryData.map(category => {
  const filteredCourses = category.courses.filter(course => {
      if (level && level !== "all" && course.career_level?.name !== level) return false;
      if (searchTerm && !course.CourseName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
    return {
      ...category,
      filteredCourseCount: filteredCourses.length,
      filteredCourses,
    };
  });

  return (
    <div className="grid grid-rows-[auto_auto_1fr] grid-cols-4 gap-4 h-screen mr-4">
      {/* Top summary cards */}
      <div className="col-span-4 grid grid-cols-2 gap-4">
        <div className="border-2 border-primary rounded-md p-4 bg-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2 font-header text-primary">
            <FontAwesomeIcon icon={faBookBookmark} />
            <p>Distributed</p>
          </div>
          <p>{distributionStatus.distributed} Course</p>
        </div>
        <div className="border-2 border-primary rounded-md p-4 bg-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2 font-header text-primary">
            <FontAwesomeIcon icon={faBookmark} />
            <p>Published</p>
          </div>
          <p>{distributionStatus.published} Course</p>
        </div>
      </div>

      <div className="col-span-3"></div>

      <div className="col-span-4 grid grid-cols-4 gap-4 h-full overflow-hidden min-h-0">
        <div className="col-span-1 flex flex-col h-full min-h-0">
          <div className="col-span-1 text-primary flex flex-col justify-center">
            <p className="font-header">Categories</p>
            <p className="font-text text-xs text-inactive">
              This is the given categories of created published courses
            </p>
          </div>
          <div className="flex-grow overflow-auto border border-divider rounded-md bg-white p-2">
            <div className={`p-2 mb-1 rounded-md shadow-md cursor-pointer flex justify-between items-center ${
                selectedCategoryId === null
                  ? "bg-primary text-white"
                  : "bg-white text-primary border border-primary"
              }`}
              onClick={() => handleCategoryClick(null)}
            >
              <span>All</span>
              <span className="text-sm">
                {filteredCategoryData.reduce((acc, curr) => acc + curr.filteredCourseCount, 0)} courses
              </span>
            </div>

            {filteredCategoryData.map((item) => (
              <div className={`p-2 mb-1 rounded-md shadow-md cursor-pointer flex justify-between items-center ${selectedCategoryId === item.id
                    ? "bg-primary text-white"
                    : "bg-white text-primary border border-primary"
                }`}
                key={item.id}
                onClick={() => handleCategoryClick(item.id)}
              >
                <span>{item.category_name}</span>
                <span className="text-sm">
                  {item.filteredCourseCount} course{item.filteredCourseCount !== 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-3 flex flex-col h-full min-h-0">
          <div className="flex items-center justify-between mb-4 gap-4">
            <Select value={level} onValueChange={setLevel} className="w-64 flex-shrink-0">
                <SelectTrigger className="w-64 border-2 border-primary bg-white text-primary font-header">
                    <SelectValue placeholder="Select Career Level" />
                </SelectTrigger>
                <SelectContent className="text-primary">
                    <SelectItem value="all">All Levels</SelectItem>

                    {career_level.map((item) => (
                    <SelectItem key={item.id} value={item.name}> {item.name} </SelectItem>
                    ))}
                </SelectContent>
            </Select>


            <div className="flex border-2 border-primary rounded-md overflow-hidden w-full max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 flex-grow focus:outline-none text-sm"
                placeholder="Search courses"
              />
              <div className="bg-primary text-white px-4 py-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faSearch} />
              </div>
            </div>
          </div>

          <div className="flex-grow bg-white border border-divider rounded-md p-4">
            <ScrollArea className="h-full">
              <CategoryCourseSelection allCourses={displayedCourses} categoryId={selectedCategoryId} />
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}
