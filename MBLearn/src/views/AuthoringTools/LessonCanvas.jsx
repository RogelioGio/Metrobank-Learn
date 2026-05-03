import { faAlignCenter, faAlignLeft, faAlignRight, faBold, faQuoteRight, faCode, faPencil, faItalic, faListNumeric, faListSquares, faSpinner, faImage, faSave, faStrikethrough, faUnderline, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFormik } from "formik";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";
import React, { useEffect, useRef, useState, useContext, useMemo } from 'react';
import { useParams } from "react-router";
import { renameTypeKeyConditionally } from "MBLearn/src/components/lib/changeKeyName";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetOverlay, SheetTitle, SheetTrigger } from "MBLearn/src/components/ui/sheet"
import * as Yup from "yup"

import { EditorContent, useEditor } from '@tiptap/react';
import './LessonCanvas.css'

import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import YouTube from '@tiptap/extension-youtube';

import { StarterKit } from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import axiosClient from "MBLearn/src/axios-client"

import { Link } from '@tiptap/extension-link';

import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useLessonCanvas } from "MBLearn/src/contexts/LessonCanvasContext";
import { useCreateCourse } from "MBLearn/src/contexts/CreateCourseContext";
import { set } from "date-fns";
import { ScrollArea } from "MBLearn/src/components/ui/scroll-area";
import LessonDetails from "MBLearn/src/modalsandprops/AuthoringTool/LessonDetails";
import SuccessModal from "MBLearn/src/modalsandprops/AuthoringTool/SuccessModal";
import FileErrorModal from "MBLearn/src/modalsandprops/AuthoringTool/FileErrorModal";
import LessonCollaborationSheet from "MBLearn/src/modalsandprops/LessonCollaborationSheet";
import LessonCollaborationModal from "MBLearn/src/modalsandprops/LessonCollaborationModal";

export default function LessonCanvas() {
    
    const {setPageTitle, setShowBack, setShouldConfirmBack} = useStateContext();
    const [editLessonName, setEditLessonName] = useState(false);
    const {lesson, setLesson} = useLessonCanvas();
    const [openDetails, setOpenDetails] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const {course, setCourse} = useCreateCourse();

    const { id: lessonId } = useParams();
    const [courses, setCourses] = useState(null);

    useEffect(() => {
        if (lessonId) {
            axiosClient.get(`/fetchCourseOfLesson/${lessonId}`)
                .then(({ data }) => {
                    setCourses(data);
                })
                .catch(error => {
                    console.error("Failed to fetch course:", error);
                });
        }
    }, [lessonId]);

    useEffect(() => {
        setPageTitle("LESSON CANVAS");
        setShowBack(true);
        setShouldConfirmBack(true);

        return () => {
            setShouldConfirmBack(false);
            setShowBack(false);
        };
    }, []);


    const getLessonContext = () => {
        axiosClient.get(`/getLesson/${lessonId}`)
        .then(({ data }) => {
            setLesson(data.lesson);
        })
        .catch(error => {
            console.error("Failed to fetch lesson:", error);
        });
    }


    useEffect(() => {
        if (!lessonId) return;
        getLessonContext();
    }, [lessonId]);

    // ang weird nito haaha
    useEffect(() => {
        if (!lessonId) return;

        setLesson(null);
        setCourse(null);
        setLessonContent(null);
        setLessonContentAsJSON(null);

        setLoading(true);
        getLessonContext();
        fetchLessonContent();
    }, [lessonId]);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    /// --------------------
    /// Fetch Lesson Content
    /// --------------------
    const lessonName = lesson?.LessonName ?? "";
    const [lessonContent, setLessonContent] = useState(null);
    const [lessonContentAsJSON, setLessonContentAsJSON] = useState(null);

    const fetchLessonContent = async () => {
        try {
        const response = await axiosClient.get(`/fetchLessonContent/${lessonId}`);

        setLessonContent(response.data.LessonContent);
        setLessonContentAsJSON(response.data.LessonContentAsJSON);

        } catch (err) {
        console.error('Failed to fetch lesson data', err);
        } finally {
        setLoading(false);
        }
    };

    /// --------------------
    /// Image Uploader
    /// --------------------
    const [fileErrorModalOpen, setFileErrorModalOpen] = useState(false);

    const handleAddImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            if (!file.type.startsWith('image/')) {
                setFileErrorModalOpen(true);
                return;
            }

            const formData = new FormData();
            formData.append('file_path', file);

            try {
                setLoading(true);
                const res = await axiosClient.post('/uploadLessonImage', formData);
                const imageUrl = res.data.url;

                editor.chain().focus().setImage({ src: imageUrl }).run();
            } catch (error) {
                console.error('Upload failed:', error);
                setFileErrorModalOpen(true);
            } finally {
                setLoading(false);
            }
        };

        input.click();
    };


    /// --------------------
    /// Update Lesson Content
    /// --------------------
    const lessonContentForm = useFormik({
        initialValues: {
            LessonContent: '',
            LessonContentAsJSON: '',
        },
        onSubmit: async (values) => {
            setSaving(true);
            try {
                await axiosClient.put(`/updateLessonContent/${lessonId}/${lesson?.course_id}`, values);
            } catch (error) {
                console.error("The Error: ", error);
            } finally {
                setSaving(false);
                setShowSuccessModal(true);
            }
        },
    });

    const [status, showStatus] = useState('');
    useEffect(() => {
        // console.log('Connection status state updated:', status);
    }, [status]);

    const { user } = useStateContext();
    const [userCount, setUserCount] = useState(1);

    const previousImages = useRef([]);

    
    const randomColor = () => {
        const color = Math.floor(Math.random() * 16777215).toString(16);
        return '#' + color.padStart(6, '0');
    };

    const limit = 5000

    const handleToggle = (action) => {
        editor.chain().focus()[action]().run();
    };

    // const ydoc = useMemo(() => new Y.Doc(), [lessonId]);
    // const provider = useMemo(() => {
    //     const newProvider = new HocuspocusProvider({
    //         url: 'wss://compelearn.onrender.com',
    //         name: `lesson-doc-${lessonId}`,
    //         document: ydoc,
    //     });
    //     // console.log('[PROVIDER] Created provider:', newProvider.awareness.clientID);
    //     return newProvider;
    // }, [lessonId, ydoc]);
    
    // useEffect(() => {
    //     if (!provider) return;

    //     const onAwarenessChange = () => {
    //         const states = provider.awareness.getStates();
    //         const uniqueUsers = new Set();

    //         // console.log('Awareness states:', states);

    //         states.forEach(state => {
    //             if (state.user?.name) {
    //                 uniqueUsers.add(state.user.name);
    //             }
    //         });

    //         setUserCount(uniqueUsers.size);
    //     };

    //     const onStatusChange = (event) => {
    //         // console.log('Connection status:', event.status);
    //         showStatus(event.status === 'connected' ? 'Connected' : 'Disconnected');
    //     };

    //     const onConnect = () => {};
    //     const onDisconnect = () => {};

    //     provider.awareness.on('change', onAwarenessChange);
    //     provider.on('status', onStatusChange);
    //     provider.on('connect', onConnect);
    //     provider.on('disconnect', onDisconnect);

    //     // Manually trigger onAwarenessChange on mount
    //     onAwarenessChange();
    //     showStatus('Connecting...');

    //     return () => {
    //         console.log('Disconnecting from provider...');

    //         // Important: clean up awareness state first
    //         provider.awareness.setLocalState(null);

    //         provider.awareness.off('change', onAwarenessChange);
    //         provider.off('status', onStatusChange);
    //         provider.off('connect', onConnect);
    //         provider.off('disconnect', onDisconnect);

    //         provider.disconnect();
    //         provider.destroy();
    //         ydoc.destroy();

    //         console.log('Disconnected from provider!');
    //     };
    // }, [provider, ydoc]);


    


    const editor = useEditor({
        extensions: [
        TextStyle, FontFamily, Underline, Image, YouTube,

        CharacterCount.configure({ limit }),
        StarterKit.configure({ history: false }),
        Placeholder.configure({ placeholder: 'Type to Create your Own Lesson . . .' }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),

        Link.configure({
            openOnClick: true,
            autolink: true,
            defaultProtocol: 'https',
            protocols: ['https'],
            isAllowedUri: (url, ctx) => {
            try {
                const parsedUrl = url.includes(':') ? new URL(url) : new URL(`${ctx.defaultProtocol}://${url}`);
                const domain = parsedUrl.hostname.toLowerCase();
                const allowedDomains = ['wikipedia.org', 'britannica.com', 'researchgate.net'];
                const allowedTLDs = ['.gov', '.edu', '.org'];
                return (
                allowedDomains.some(domainName => domain.endsWith(domainName)) ||
                allowedTLDs.some(tld => domain.endsWith(tld))
                );
            } catch {
                return false;
            }
            },
            shouldAutoLink: url => {
            try {
                const parsedUrl = url.includes(':') ? new URL(url) : new URL(`https://${url}`);
                const domain = parsedUrl.hostname.toLowerCase();
                const allowedDomains = ['wikipedia.org', 'britannica.com'];
                const allowedTLDs = ['.gov', '.edu', '.org'];
                return (
                allowedDomains.some(domainName => domain.endsWith(domainName)) ||
                allowedTLDs.some(tld => domain.endsWith(tld))
                );
            } catch {
                return false;
            }
            }
        }),
        // Collaboration.configure({ document: provider ? provider.document : ydoc }),
        // CollaborationCursor.configure({
        //     provider,
        //     user: {
        //     name: `${user?.user_infos?.first_name}'s Cursor`,
        //     color: randomColor(),
        //     },
        // }),
        ],
        // editable: !!provider,
        editable: true,
    });
    
    // useEffect(() => {

    //     return () => {
    //         provider.awareness.setLocalState(null);
    //         provider.destroy();
    //         ydoc.destroy();

    //         editor?.destroy();
    //     };
    // }, [provider, editor]);
    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);


    const percentage = editor
        ? Math.round((100 / limit) * editor.storage.characterCount.characters())
        : 0

    const newContent = useMemo(() => {
        if (!lessonContentAsJSON) return null;
        try {
        return typeof lessonContentAsJSON === 'string'
            ? JSON.parse(lessonContentAsJSON)
            : lessonContentAsJSON;
        } catch (e) {
        console.error('Failed to parse lessonContentAsJSON', e);
        return null;
        }
    }, [lessonContentAsJSON]);

    /// --------------------
    /// JSON Converter
    /// --------------------
    function normalizeNodeKeys(node) {
        if (Array.isArray(node)) {
        return node.map(normalizeNodeKeys);
        }
        if (node && typeof node === 'object') {
        const newNode = { ...node };

        if ('textType' in newNode) {
            newNode.type = 'paragraph';
            delete newNode.textType;
        } else if ('headerBlock' in newNode) {
            newNode.type = newNode.headerBlock;
            delete newNode.headerBlock;
        } else if ('bulletListBlock' in newNode) {
            newNode.type = newNode.bulletListBlock;
            delete newNode.bulletListBlock;
        } else if ('blockQuoteBlock' in newNode) {
            newNode.type = newNode.blockQuoteBlock;
            delete newNode.blockQuoteBlock;
        } else if ('videoBlock' in newNode) {
            newNode.type = newNode.videoBlock;
            delete newNode.videoBlock;
        } else if ('imageBlock' in newNode) {
            newNode.type = newNode.imageBlock;
            delete newNode.imageBlock;
        } else if ('orderListBlock' in newNode) {
            newNode.type = newNode.orderListBlock;
            delete newNode.orderListBlock;
        }

        if (newNode.content) {
            newNode.content = normalizeNodeKeys(newNode.content);
        }

        if (newNode.marks) {
            newNode.marks = newNode.marks.map(mark => {
            if (mark && typeof mark === 'object') {
                return normalizeNodeKeys(mark);
            }
            return mark;
            });
        }

        return newNode;
        }

        return node;
    }

    /// --------------------
    /// Syncing of Documents
    /// --------------------
    // useEffect(() => {
    //     if (!editor || !provider || !newContent) return;

    //     const yjsFragment = provider.document.get('default', Y.XmlFragment);

    //     const loadContent = () => {
    //     if (yjsFragment.length === 0) {
    //         yjsFragment.delete(0, yjsFragment.length);
    //         const normalizedContent = normalizeNodeKeys(newContent);
    //         editor.commands.setContent(normalizedContent);
    //     }
    //     };

    //     const onSynced = (synced) => {
    //     if (synced.state) {
    //         loadContent();
    //         }
    //     };

    //     provider.on('synced', onSynced);
    //     if (provider.isSynced) {
    //         loadContent();
    //     }
    //     return () => provider.off('synced', onSynced);

    // }, [editor, provider, newContent]);
    const [contentLoaded, setContentLoaded] = useState(false);

    useEffect(() => {
        if (!editor || !newContent || contentLoaded) return;

        editor.commands.setContent(normalizeNodeKeys(newContent));
        setContentLoaded(true);
    }, [editor, newContent, contentLoaded]);


    useEffect(() => {
        if (!editor) return;

        const updateHandler = () => {
            const json = editor.getJSON();
            const snapshot = JSON.parse(JSON.stringify(json));

            const cleaned = cleanEmptyNodes(json);
            const renamed = renameTypeKeyConditionally(cleaned);

            setLessonContentAsJSON(renamed);
            lessonContentForm.setFieldValue('LessonContentAsJSON', JSON.stringify(renamed));
            lessonContentForm.setFieldValue('LessonContent', editor.getHTML());
        };

        editor.on('update', updateHandler);

        return () => {
            editor.off('update', updateHandler);
        };
    }, [editor, lessonContentForm]);


    useEffect(() => {
        if (!editor) return;

        const handleUpdate = () => {
        const htmlContent = editor.getHTML();
        const currentImages = Array.from(
            htmlContent.matchAll(/<img[^>]+src="([^">]+)"/g)
        ).map(match => match[1]);

        const removedImages = previousImages.current.filter(
            prevImg => !currentImages.includes(prevImg)
        );

        const token = localStorage.getItem('token');
        removedImages.forEach((url) => {
            axiosClient.post('/deleteLessonImage',
            { url },
            {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            ).then(() => {
                console.log('Deleted image: ${url}');
            }).catch(err => {
                console.error('Delete failed', err);
            });
        });

        previousImages.current = currentImages;
        };

        editor.on('update', handleUpdate);

        return () => editor.off('update', handleUpdate);
    }, [editor]);

    useEffect(() => {
        if (!lessonId) return;
        setLoading(true);      // Set loading true right before fetch
        fetchLessonContent();
    }, [lessonId]);


    function cleanEmptyNodes(node) {
        if (!node || typeof node !== 'object') return null;

        if (node.type === 'youtube' || node.type === 'image') {
            return node;
        }

        if (Array.isArray(node.content)) {
            node.content = node.content
                .map(cleanEmptyNodes)
                .filter(Boolean);

            if (node.content.length === 0 &&
                ['heading', 'paragraph', 'link', 'bulletList', 'orderedList', 'blockquote', 'codeBlock'].includes(node.type)
            ) {
                return null;
            }
        } else if (node.content === undefined) {
            if (
                ['heading', 'paragraph', 'link', 'bulletList', 'orderedList', 'blockquote', 'codeBlock'].includes(node.type)
            ) {
                return null;
            }
        }

        if (node.text !== undefined) {
            if (typeof node.text !== 'string' || node.text.trim().length === 0) {
                return null;
            }
        }

        return node;
    }


    const [newContributions, setNewContributions] = useState(3);

    /// --------------------
    /// Collab Contributions Sheet
    /// --------------------
    const [showContributionsSheet, setShowContributionsSheet] = useState(false);
    const [showContributionsModal, setShowContributionsModal] = useState(false);
    const [selectedContribution, setSelectedContribution] = useState(null);
    const [selectedContributionNumber, setSelectedContributionNumber] = useState(null);

    const openContributionModal = (contribution, number) => {
        setSelectedContribution(contribution);
        setSelectedContributionNumber(number);
        setShowContributionsModal(true);
        setShowContributionsSheet(false);
    };

    const closeContributionModal = () => {
        setShowContributionsModal(false);
        setShowContributionsSheet(true);
    };

    return (
        <div className="grid h-full w-full grid-cols-4 grid-rows-[min-content_1fr] gap-2">
            {/* Header */}
            <div className="flex flex-row w-full col-span-4 items-center h-full gap-4 justify-between pr-4">
                <div className="flex flex-row items-center gap-2">
                    <div className={`w-10 h-10 p-2 shadow-md border-2 rounded-md flex items-center justify-center border-primary cursor-pointer bg-white text-primary hover:bg-primaryhover hover:text-white transition-all ease-in-out ${ loading ? 'pointer-events-none opacity-50 cursor-default' : '' }`}
                        onClick={() => !loading && setOpenDetails(true)}
                    >
                        <FontAwesomeIcon icon={faPencil} className="text-xl" />
                    </div>

                    <div>
                        <p className="text-xs text-unactive font-text">Lesson Name:</p>
                        <p className="text-xl font-header text-primary">
                            {lesson?.LessonName || lesson?.title}
                        </p>
                        <p className="text-xs font-text text-unactive">
                            {lesson?.CourseName} (
                            {lesson?.created_course?.category.category_name} -{' '}
                            {lesson?.created_course?.career_level.name} Level)
                        </p>
                    </div>
                </div>

                <div className="relative inline-block">
                    <button className="text-sm font-medium text-white bg-primary hover:bg-primary/80 px-4 py-2 rounded-md transition-colors whitespace-nowrap flex items-center"
                        onClick={() => {
                            console.log("View Collaborator's Contribution clicked");
                            setNewContributions(0);
                            setShowContributionsSheet(true);
                        }}
                    >
                        <FontAwesomeIcon icon={faUserGroup} className="mr-2" />
                        View Collaborator's Contribution
                    </button>

                    {newContributions > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {newContributions}
                        </span>
                    )}
                </div>

                <Sheet open={showContributionsSheet} onOpenChange={setShowContributionsSheet}>
                    <SheetOverlay className="bg-gray-500/75 backdrop-blur-sm transition-all" />
                    <SheetContent className="h-full flex-col flex">
                        <SheetHeader>
                        <SheetTitle className="font-header text-2xl text-primary mb-1">
                            Collaborator's Contributions
                        </SheetTitle>
                        <SheetDescription className="text-sm text-unactive mb-5">
                            Detailed contribution history for the lesson
                        </SheetDescription>
                        </SheetHeader>

                        <LessonCollaborationSheet openContributionModal={openContributionModal} />

                        <SheetClose
                        className="mt-6 inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none"
                        onClick={() => setShowContributionsSheet(false)}
                        >
                        Close
                        </SheetClose>
                    </SheetContent>
                </Sheet>

            </div>

            {/* TipTap */}
            <div className="col-span-4 mb-4 mr-4 flex">
                <div className="bg-white w-full h-full rounded-md border border-divider flex flex-col justify-between overflow-visible">
                    <div className={`bg-gray-100 p-3 flex flex-row gap-2 justify-between border-b border-divider ${loading ? 'pointer-events-none opacity-50' : ''}`}>
                        <div className="flex flex-row gap-3 items-center">

                        {/* Text Design */}
                        <div className="flex gap-2">

                            <div className="relative w-44 h-8 group">
                                <div className="w-full h-full flex items-center justify-center cursor-pointer border-primary border-2 rounded bg-white text-primary">
                                    Font Families
                                </div>

                                <div className="absolute top-full left-0 w-full -mt-0.5 hidden group-hover:flex flex-col gap-1 z-10 bg-white border border-primary rounded p-1 max-h-48 overflow-auto">
                                    {[ 'Arial', 'Courier New', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana' ].map((family) => 
                                    <div className={`w-full h-8 border-2 rounded flex items-center justify-center cursor-pointer text-xs font-bold whitespace-nowrap ${
                                        editor.isActive('textStyle', { fontFamily: family })
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-primary border-primary'
                                        }`}
                                        key={family}
                                        style={{ fontFamily: family }}
                                        onClick={() =>
                                        !loading &&
                                            editor.chain().focus().setFontFamily(family).run()
                                        }
                                    >
                                        {family}
                                    </div>
                                    )}

                                    <div className={`w-full h-8 border-2 rounded flex items-center justify-center cursor-pointer text-xs font-bold ${
                                        !editor.getAttributes('textStyle').fontFamily
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-primary border-primary'
                                    }`}
                                    onClick={() =>
                                        !loading &&
                                        editor.chain().focus().unsetFontFamily().run()
                                    }
                                    >
                                    Default
                                    </div>
                                </div>

                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                    Font Family
                                </div>
                            </div>


                            {/* Bold */}
                            <div className="relative group">
                                <div className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive('bold')
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && handleToggle('toggleBold')}
                                >
                                <FontAwesomeIcon icon={faBold} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Bold
                                </div>
                            </div>

                            {/* Italic */}
                            <div className="relative group">
                                <div className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive('italic')
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && handleToggle('toggleItalic')}
                                >
                                <FontAwesomeIcon icon={faItalic} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Italic
                                </div>
                            </div>

                            {/* Underline */}
                            <div className="relative group">
                                <div className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive('underline')
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && handleToggle('toggleUnderline')}
                                >
                                <FontAwesomeIcon icon={faUnderline} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Underline
                                </div>
                            </div>

                            {/* Strikethrough */}
                            <div className="relative group">
                                <div className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive('strike')
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && handleToggle('toggleStrike')}
                                >
                                <FontAwesomeIcon icon={faStrikethrough} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Strikethrough
                                </div>
                            </div>

                            {/* Code Block */}
                            <div className="relative group">
                                <div className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive('codeBlock')
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && handleToggle('toggleCodeBlock')}
                                >
                                <FontAwesomeIcon icon={faCode} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Code Block
                                </div>
                            </div>

                            {/* Blockquote */}
                            <div className="relative group">
                                <div className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive('blockquote')
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && handleToggle('toggleBlockquote')}
                                >
                                <FontAwesomeIcon icon={faQuoteRight} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Blockquote
                                </div>
                            </div>
                        </div>

                        {/* Headings */}
                        <div className="relative w-44 h-8 group">
                            <div className="w-full h-full flex items-center justify-center cursor-pointer border-primary border-2 rounded bg-white text-primary">
                                Headings
                            </div>
                            <div className="absolute top-full left-0 w-full -mt-0.5 hidden group-hover:flex flex-col gap-1 z-10 bg-white border border-primary rounded p-1">
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                <div
                                    key={level}
                                    className={`w-full h-8 border-2 rounded flex items-center justify-center cursor-pointer text-xs font-bold ${
                                    editor.isActive('heading', { level })
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-primary border-primary'
                                    }`}
                                    onClick={() =>
                                    !loading &&
                                    editor.chain().focus().toggleHeading({ level }).run()
                                    }
                                >
                                    Heading {level}
                                </div>
                                ))}
                            </div>
                            <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Headings
                            </div>
                        </div>

                        <div className="w-[2px] h-8 bg-unactive"></div>

                        {/* Text Alignment */}
                        <div className="flex gap-2">
                            {/* Align Left */}
                            <div className="relative group">
                                <div
                                className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive({ textAlign: 'left' })
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && editor.chain().focus().setTextAlign('left').run()}
                                >
                                <FontAwesomeIcon icon={faAlignLeft} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Align Left
                                </div>
                            </div>

                            {/* Align Center */}
                            <div className="relative group">
                                <div
                                className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive({ textAlign: 'center' })
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && editor.chain().focus().setTextAlign('center').run()}
                                >
                                <FontAwesomeIcon icon={faAlignCenter} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Align Center
                                </div>
                            </div>

                            {/* Align Right */}
                            <div className="relative group">
                                <div
                                className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                    editor.isActive({ textAlign: 'right' })
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-primary'
                                }`}
                                onClick={() => !loading && editor.chain().focus().setTextAlign('right').run()}
                                >
                                <FontAwesomeIcon icon={faAlignRight} />
                                </div>
                                <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                Align Right
                                </div>
                            </div>
                        </div>

                        <div className="w-[2px] h-8 bg-unactive"></div>
                            {/* List Format */}
                            <div className="flex gap-2 items-center">
                                {/* Ordered List */}
                                <div className="relative group">
                                    <div
                                    className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                        editor.isActive('orderedList')
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-primary border-primary'
                                    }`}
                                    onClick={() => !loading && handleToggle('toggleOrderedList')}
                                    >
                                    <FontAwesomeIcon icon={faListNumeric} />
                                    </div>
                                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                    Ordered List
                                    </div>
                                </div>
                                {/* Bullet List */}
                                <div className="relative group">
                                    <div
                                    className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out ${
                                        editor.isActive('bulletList')
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-primary border-primary'
                                    }`}
                                    onClick={() => !loading && handleToggle('toggleBulletList')}
                                    >
                                    <FontAwesomeIcon icon={faListSquares} />
                                    </div>
                                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                    Bullet List
                                    </div>
                                </div>

                                <div className="w-[2px] h-8 bg-unactive"></div>

                                {/* Add Image */}
                                <div className="relative group">
                                    <div
                                        className={`w-8 h-8 border-2 rounded flex items-center justify-center cursor-pointer hover:bg-primaryhover hover:text-white transition-all ease-in-out
                                        ${loading ? 'pointer-events-none opacity-50 cursor-default' : 'bg-white text-primary border-primary'}
                                        `}
                                        onClick={() => !loading && handleAddImage()}
                                    >
                                        {loading ? (
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        ) : (
                                        <FontAwesomeIcon icon={faImage} />
                                        )}
                                    </div>

                                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                        Add Image
                                    </div>
                                </div>
                            </div>
                        </div>

                    <button
                        type="submit"
                        className={`w-fit h-fit border-primary border-2 rounded bg-white text-primary flex items-center justify-center px-4 py-1 gap-2 transition-all ease-in-out
                            ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:cursor-pointer hover:bg-primaryhover hover:text-white'}`}
                        onClick={() => !saving && lessonContentForm.handleSubmit()}
                        disabled={saving}
                        >
                        {saving ? 
                            <FontAwesomeIcon icon={faSpinner} spin className="text-primary" />
                        : 
                            <>
                            <p className="font-header">Save</p>
                            <FontAwesomeIcon icon={faSave} />
                            </>
                        }
                    </button>


                    </div>
                    <ScrollArea className="h-[calc(100vh-17.3rem)]">
                        <EditorContent editor={editor} className="w-full h-full p-4 focus:outline-none focus:ring-0 focus:border-transparent"/>
                    </ScrollArea>

                    <div className='toolsRight bg-gray-100 p-4 flex flex-row justify-between items-center border-t border-divider'>
                        {/* <div className='info'>
                            {editor.storage.characterCount.words()} word/s | {editor.storage.characterCount.characters()} / {limit} character/s
                        </div> */}
                        <p className="text-xs">{editor.storage.characterCount.words()} word/s</p>
                        <p className="text-xs">{editor.storage.characterCount.characters()} / {limit} character/s</p>
                    </div>

                </div>
            </div>

        <LessonDetails open={openDetails} close={() => setOpenDetails(false)} lesson={lesson} lessonName={lessonName}
        onUpdate={(updatedLesson) => {
            setLesson(updatedLesson);
        }}
        />
        <SuccessModal open={showSuccessModal} close={() => setShowSuccessModal(false)} header="Success!" desc="Your changes have been saved." confirmLabel="Close"/>

        <FileErrorModal
            open={fileErrorModalOpen}
            onClose={() => setFileErrorModalOpen(false)}
            header="Invalid Image File"
            desc="Please upload a valid image file (JPG or PNG)."
        />

        <LessonCollaborationModal
            isOpen={showContributionsModal}
            onClose={closeContributionModal}
            contribution={selectedContribution}
            contributionNumber={selectedContributionNumber}
        />

        </div>
    )
}
