<?php

namespace App\Http\Controllers\Api;

use App\Events\NotificationsMarkedAsRead;
use App\Events\TestEvent;
use App\Http\Controllers\Controller;
use App\Models\UserCredentials;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
        'auth_user_id' => $user->id,
        'notifications' => $user->notifications()->orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function hasUnreadNotifications(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
        }

        $unreadCount = $user->unreadNotifications->count();

        return response()->json([
            'has_unread' => $unreadCount > 0,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAllAsRead(){
        $user = auth()->user();

        $user->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.'], 200);
    }

    public function destroy($id){
        $notification = DatabaseNotification::findOrFail($id);

        $notification->delete();

        return response()->json(['message' => 'Notification deleted successfully.'], 200);
    }


}
