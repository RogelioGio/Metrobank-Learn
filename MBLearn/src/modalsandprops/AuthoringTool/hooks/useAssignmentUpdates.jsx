import { useEffect } from "react";
import { echoPusherInstance } from "MBLearn/echoPusher";
import { useStateContext } from "MBLearn/src/contexts/ContextProvider";

function useAssignmentUpdates(userInfoId, onUpdate) {
  const { token } = useStateContext();

  useEffect(() => {
    if (!userInfoId || !token) return;

    const echo = echoPusherInstance(token);
    const channelName = `course.assignments.${userInfoId}`;
    console.log(`Subscribing to ${channelName} channel...`);

    const channel = echo.private(channelName);

    const listener = (event) => {
      console.log('Assignment Updated!', event);
      onUpdate(event.userInfoId);
    };

    channel.listen('.CourseAssignmentUpdated', listener);

    channel.subscribed(() => {
      console.log(`Subscribed to ${channelName} successfully.`);
    });

    return () => {
      console.log(`Leaving channel ${channelName} and removing listener`);
      channel.stopListening('.CourseAssignmentUpdated', listener);
      echo.leave(channelName);
    };
  }, [userInfoId, token, onUpdate]);
}

export default useAssignmentUpdates;
