import { useEffect, useState } from "react";

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faCheck, faEllipsis, faHandshake, faCircleUser } from '@fortawesome/free-solid-svg-icons';

import styles from "../../../assets/compeLearn/styles/modules/dashboard-module/AdminDashboard.module.css";
import globalStyles from "../../../assets/compeLearn/global.module.css";

import Carousel from './Carousel';

import SideNavBar from "../../SideNavBar";

import axiosClient from "MBLearn/src/axios-client";

function AdminDashboard() {

    const [counts, setCounts] = useState ({
        courseCount: 0,
        publishedCourseCount: 0,
        unpublishedCourseCount: 0,
        sharedCourseCount: 0
    });

    const [recentlyModifiedCourses, setRecentlyModifiedCourses] = useState(null);
    const fetchRecentlyModifiedCourses = async () => {
        const response = await axiosClient.get('/api/getRecentlyModifiedCourses?limit=4');
        setRecentlyModifiedCourses(response.data);
    };

    const [categories, setCategories] = useState([]);
    const fetchCategoriesWithCounts = async () => {
        const response = await axiosClient.get('/getCategoriesWithCounts');
        setCategories(response.data);
    };


    useEffect(() => {
        fetchCounts();
        fetchRecentlyModifiedCourses();
        fetchCategoriesWithCounts();
    }, []);

    const fetchCounts = async () => {
        const response = await axiosClient.get('/getCounts');

        setCounts({
            courseCount: response.data.courseCount,
            publishedCourseCount: response.data.publishedCourseCount,
            unpublishedCourseCount: response.data.unpublishedCourseCount,
            sharedCourseCount: response.data.sharedCourseCount
        });

        console.log(counts);
    };

    return (
    <>
        <div className={globalStyles.mainContainer}>
                <SideNavBar />

            <div className={globalStyles.parentContainer}>
                <div className={globalStyles.header}>
                    <h1>DASHBOARD</h1>
                </div>

                <div className={globalStyles.mainContent}>

                    <div className={styles.dashboardContainer}>
                        <div className={styles.box1}>
                            <div className={styles.carouselBox}>
                                <Carousel />
                            </div>
                            <div className={styles.cardsBox}>
                                <div className={styles.cards}>
                                    <div className={styles.card}>
                                        <FontAwesomeIcon icon={faBook} className={styles.icon} />
                                        <div className={styles.cardInfo}>
                                            <h1>{counts.courseCount}</h1>
                                            <p>Courses</p>
                                        </div>
                                    </div>
                                    <div className={styles.card}>
                                        <FontAwesomeIcon icon={faCheck} className={styles.icon} />
                                        <div className={styles.cardInfo}>
                                            <h1>{counts.publishedCourseCount}</h1>
                                            <p>Published</p>
                                        </div>
                                    </div>
                                    <div className={styles.card}>
                                        <FontAwesomeIcon icon={faEllipsis} className={styles.icon} />
                                        <div className={styles.cardInfo}>
                                            <h1>{counts.unpublishedCourseCount}</h1>
                                            <p >Pending</p>
                                        </div>
                                    </div>
                                    <div className={styles.card}>
                                        <FontAwesomeIcon icon={faHandshake} className={styles.icon} />
                                        <div className={styles.cardInfo}>
                                            <h1>{counts.sharedCourseCount}</h1>
                                            <p>Shared</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.coursesBox}>
                                <h3>My Recently Modified Courses</h3>
                                {recentlyModifiedCourses && recentlyModifiedCourses.length > 0 ? (
                                <div className={styles.table}>
                                    <table className={styles.courseList}>
                                        <thead>
                                            <tr>
                                                <th>Course</th>
                                                <th>Last Modified Time</th>
                                                <th>Last Modified Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentlyModifiedCourses.map(course => {
                                                const { date, time } = splitDateTime(course.updated_at_formatted);
                                                return (
                                                    <tr key={course.id}>
                                                        <td><Link to={`/course-lesson/${course.id}`}>{course.CourseName}</Link></td>
                                                        <td>{time}</td>
                                                        <td>{date}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>


                                ) : (
                                    <p>No recently modified courses found.</p>
                                )}
                            </div>
                        </div>

                        <div className={styles.box2}>
                            <div className={styles.calendarBox}>
                                <FullCalendar
                                    plugins={[dayGridPlugin]}
                                    initialView="dayGridMonth"
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'viewEventsButton',
                                    }}
                                    customButtons={{
                                        viewEventsButton: {
                                            text: 'View Events',
                                            click: () => {
                                                window.location.href = '/calendar-events';
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className={styles.categoriesBox}>
                                <h3>Categories and Course Counts</h3>
                                <div className={styles.categories}>
                                    {categories.length > 0 ? (
                                        categories.map(category => (
                                        <Link key={category.id} to={`/category-view/${category.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className={styles.course}>
                                                <strong>{category.CategoryName}</strong>
                                                <div>{category.courses_count} Courses</div>
                                            </div>
                                        </Link>
                                        ))
                                    ) : (
                                        <p>No categories found.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    </>
  );
}
export default AdminDashboard;
