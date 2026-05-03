import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import { useEffect, useState } from "react";

const Course =
{
    "type":"doc",
    "content":[
        {"headerBlock":"heading","attrs":{"textAlign":null,"level":3},
        "content":[
            {"type":"text","text":"1."},
            {"type":"text","marks":[{"type":"bold"}],"text":"Web Development with Laravel"}]},
        {"textType":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"bold"}],"text":"Description"},{"type":"text","text":":"},{"type":"hardBreak"},{"type":"text","text":"Learn how to build modern, scalable web applications using Laravel, the leading PHP framework. This course covers core concepts such as routing, Blade templating, Eloquent ORM, authentication, and API development. Ideal for developers looking to streamline backend development with elegant syntax and powerful tools."}]},{"type":"horizontalRule"},{"headerBlock":"heading","attrs":{"textAlign":null,"level":3},"content":[{"type":"text","text":"2."},{"type":"text","marks":[{"type":"bold"}],"text":"Full-Stack Web Development"}]},{"textType":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"bold"}],"text":"Description"},{"type":"text","text":":"},{"type":"hardBreak"},{"type":"text","text":"Master both frontend and backend technologies in this comprehensive course. You'll learn HTML, CSS, JavaScript, React, Node.js, Express, and MongoDB to build complete web applications. Includes hands-on projects and deployment strategies to launch your apps online."}]},{"type":"horizontalRule"},{"headerBlock":"heading","attrs":{"textAlign":null,"level":3},"content":[{"type":"text","text":"3."},{"type":"text","marks":[{"type":"bold"}],"text":"Introduction to HTML & CSS"}]},{"textType":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"bold"}],"text":"Description"},{"type":"text","text":":"},{"type":"hardBreak"},{"type":"text","text":"This beginner-friendly course introduces the building blocks of the web. Learn how to create and style responsive web pages using HTML and CSS. No prior coding experience required."}]},{"type":"horizontalRule"},{"headerBlock":"heading","attrs":{"textAlign":null,"level":3},"content":[{"type":"text","text":"4."},{"type":"text","marks":[{"type":"bold"}],"text":"JavaScript Essentials"}]},{"textType":"paragraph","attrs":{"textAlign":null},"content":[{"type":"text","marks":[{"type":"bold"}],"text":"Description"},{"type":"text","text":":"},{"type":"hardBreak"},{"type":"text","text":"Understand the fundamentals of JavaScript, the language of the web. Explore variables, functions, DOM manipulation, events, and basic debugging. A great foundation for frontend or full-stack development."}]}]}


const CourseContentCPL = ({ course }) => {
    const [lesson, setLesson] = useState(null); // Initialize with null

    useEffect(() => {
        if (course) {
            console.log("Course is:", course);
            console.log("Type:", typeof course);

            const courseData = JSON.parse(course);
            setLesson(courseData); // Ensure course is valid before setting
        } else {
            console.warn("Course prop is undefined or empty.");
        }
    }, [course]);

    // Rendering text with styles
    const renderText = (textObject, index) => {
        if (textObject.type === "hardBreak") {
            return <br key={index} />;
        }

        let element = <span key={index}>{textObject.text}</span>;

        if (textObject.marks) {
            let style = {};

            textObject.marks.slice().reverse().forEach(mark => {
                switch (mark.type) {
                    case "bold":
                        element = <strong key={index}>{element}</strong>;
                        break;
                    case "italic":
                        element = <em key={index}>{element}</em>;
                        break;
                    case "strike":
                        element = <s key={index}>{element}</s>;
                        break;
                    case "textStyle":
                        const allowedFonts = [
                            'Arial',
                            'Courier New',
                            'Georgia',
                            'Impact',
                            'Tahoma',
                            'Times New Roman',
                            'Verdana'
                        ];

                        const { fontFamily } = mark.attrs || {};

                        if (fontFamily && allowedFonts.includes(fontFamily)) {
                            style.fontFamily = fontFamily;
                        }

                        break;

                    default:
                        break;
                }
            });

            if (Object.keys(style).length > 0) {
                element = <span key={index} style={style}>{element}</span>;
            }
        }

        return element;
    };


    // List all content to be rendered
    const renderedContent = [];

    return (
        // Content helper
        <>
            {(() => {
                // if (!lesson?.content) {
                //     return <p className="text-red-500">{course || "Hello"}</p>; // Fallback message
                // }

                const renderedContent = [];
                let perBlockRef = [];
                let perBlockQuote = [];

                lesson?.content?.forEach((content, index) => {
                    if (content.blockQuoteBlock) {
                        perBlockQuote.push(
                            <p>
                                {content.content.map((block, blockindex) => {
                                    return block.content.map((text, textindex) => {
                                        return renderText(text, `${index}-${blockindex}-${textindex}`);
                                    });
                                })}
                            </p>
                        );
                    } else {
                        if (perBlockQuote.length > 0) {
                            renderedContent.push(
                                <blockquote key={`quote-${index}`} className="border-l-4 border-primary pl-4 italic text-sm font-text bg-white p-4 my-4">
                                    {perBlockQuote}
                                </blockquote>
                            );
                        }
                        perBlockQuote = [];
                    }

                    if (content.type === "codeBlock") {
                        const codeText = content.content.map(textObj => textObj.text).join('');
                        renderedContent.push(
                        <pre
                            key={`codeblock-${index}`}
                            className="bg-gray-900 p-3 rounded overflow-x-auto my-4 max-w-full"
                            style={{ color: '#ccc', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                            >
                            <code className="bg-gray-700 p-2 rounded block font-mono text-gray-300 text-sm max-w-full break-words">
                                {codeText}
                            </code>
                        </pre>
                        );
                    }

                    if (content.linkType) {
                        content.content.forEach((ref, refIndex) => {
                            perBlockRef.push(
                                <p key={refIndex} className="font-text text-sm py-1 hover:cursor-pointer hover:text-primary">
                                    <a href={ref.text} target="_blank" rel="noopener noreferrer">
                                        {ref.text}
                                    </a>
                                </p>
                            );
                        });
                    } else {
                        if (perBlockRef.length > 0) {
                            renderedContent.push(
                                <div className="mx-5 py-5" key={`ref-${index}`}>
                                    <div className="border-divider border-b py-1">
                                        <p className="font-header text-sm text-primary">Reference Link</p>
                                    </div>
                                    {perBlockRef}
                                </div>
                            );
                        }
                        perBlockRef = [];
                    }

                    if (content.textType) {
                        const align = content.attrs?.textAlign
                            ? `text-${content.attrs.textAlign}`
                            : 'text-left';

                        renderedContent.push(
                            <p key={index} className={`text-sm font-text py-1 ${align}`}>
                                {content.content?.map((text, textIndex) => renderText(text, `${index}-${textIndex}`))}
                            </p>
                        );
                    } else if (content.headerBlock) {
                        const level = content.attrs?.level || 1;
                        const alignClass = content.attrs?.textAlign
                            ? `text-${content.attrs.textAlign}`
                            : 'text-left'; // fallback to left

                        const headerContent = content.content.map((text, textIndex) => (
                            renderText(text, `${index}-${textIndex}`)
                        ));

                        const commonProps = {
                            key: index,
                            className: `font-header py-1 text-primary ${alignClass}`
                        };

                        switch (level) {
                            case 1:
                                renderedContent.push(<h1 {...commonProps} className={`text-3xl py-5 ${commonProps.className}`}>{headerContent}</h1>);
                                break;
                            case 2:
                                renderedContent.push(<h2 {...commonProps} className={`text-2xl py-4 ${commonProps.className}`}>{headerContent}</h2>);
                                break;
                            case 3:
                                renderedContent.push(<h3 {...commonProps} className={`text-xl py-3 ${commonProps.className}`}>{headerContent}</h3>);
                                break;
                            case 4:
                                renderedContent.push(<h4 {...commonProps} className={`text-lg py-2 ${commonProps.className}`}>{headerContent}</h4>);
                                break;
                            case 5:
                                renderedContent.push(<h5 {...commonProps} className={`text-base py-1 ${commonProps.className}`}>{headerContent}</h5>);
                                break;
                            case 6:
                                renderedContent.push(<h6 {...commonProps} className={`text-sm ${commonProps.className}`}>{headerContent}</h6>);
                                break;
                            default:
                                break;
                        }
                    } else if (content.videoBlock) {
                        renderedContent.push(
                            <div className="py-2" key={index}>
                                <iframe
                                    className="w-full aspect-video rounded-lg"
                                    // src={content.attrs?.src}
                                    src={content.attrs?.src?.replace("watch?v=", "embed/")}
                                    title="null"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        );
                    } else if (content.bulletListBlock) {
                        const align = content.attrs?.textAlign
                            ? `text-${content.attrs.textAlign}`
                            : 'text-left';

                        renderedContent.push(
                            <ul className={`list-disc pl-5 py-4 ${align}`} key={index}>
                                {content.content.map((bulletItem, i) => (
                                    <li key={i} className="font-text text-sm">
                                        {bulletItem.content.map((item, j) =>
                                            item.content.map((c, k) => renderText(c, `${i}-${j}-${k}`))
                                        )}
                                    </li>
                                ))}
                            </ul>
                        );
                    } else if (content.orderListBlock) {
                        const align = content.attrs?.textAlign
                            ? `text-${content.attrs.textAlign}`
                            : 'text-left';

                        renderedContent.push(
                            <ol className={`list-decimal pl-5 py-4 ${align}`} key={index}>
                                {content.content.map((orderedItem, i) => (
                                    <li key={i} className="font-text text-sm">
                                        {orderedItem.content.map((item, j) =>
                                            item.content.map((c, k) => renderText(c, `${i}-${j}-${k}`))
                                        )}
                                    </li>
                                ))}
                            </ol>
                        );
                    }
                    
                    if (content.type === "horizontalRule") {
                        renderedContent.push(
                            <hr key={index} className="border-blue-500 border-2 my-4" />
                        );
                    }

                    else if (content.imageBlock) {
                        renderedContent.push(
                            <div className="py-2" key={index}>
                                <img
                                    src={content.attrs?.src}
                                    alt={content.attrs?.alt || 'Image'}
                                    title={content.attrs?.title || ''}
                                    className="max-w-full rounded-lg"
                                />
                            </div>
                        );
                    }
                });

                return (
                    // <ScrollArea className="h-[calc(100vh-11rem)] w-full px-5 border-divider border rounded-md bg-white">
                    //     <div className="w-full min-h-[calc(100vh-11rem)]">
                    //         {renderedContent}
                    //     </div>
                    // </ScrollArea>

                    <ScrollArea className="h-full w-full px-2 rounded-md bg-white">
                        <div className="w-full h-full">
                            {renderedContent}
                        </div>
                    </ScrollArea>
                )
            })()}
        </>
    );
};

export default CourseContentCPL;