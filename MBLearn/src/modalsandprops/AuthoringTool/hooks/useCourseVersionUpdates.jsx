import { useEffect } from "react";
import { echoPusherInstance } from "MBLearn/echoPusher";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";

function useCourseVersionUpdates(courseId, onUpdate, isActive) {
  const { token, user } = useStateContext();

  useEffect(() => {
    if (!courseId || !token || !isActive) return;

    const echo = echoPusherInstance(token);
    const channelName = `course-version.${courseId}`;
    console.log(`Subscribing to ${channelName} channel...`);

    const channel = echo.private(channelName);

    const listener = (event) => {
      console.log('Received CourseVersionUpdated event', event);
      onUpdate(event.courseId);
    };

    channel.listen('.CourseVersionUpdated', listener);

    channel.subscribed(() => {
      console.log(`Subscribed to ${channelName} successfully.`);
    });

    return () => {
      console.log(`Leaving channel ${channelName} and removing listener`);
      channel.stopListening('.CourseVersionUpdated', listener);
      echo.leave(channelName);
    };
  }, [courseId, token, user?.id, onUpdate, isActive]);
}

export default useCourseVersionUpdates;
