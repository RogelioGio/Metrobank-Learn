<?php

namespace App\Http\Controllers\CompELearnController\Notification;

use App\Models\ZCompELearnNotificationMessage;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ZNotificationController extends Controller
{
  public function index(Request $request)
  {
    $userInfoId = $request->user()->userInfos->id;

    $notifications = ZCompELearnNotificationMessage::where('user_info_id', $userInfoId)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json($notifications);
  }

  public function markRead($id)
  {
    $notification = ZCompELearnNotificationMessage::findOrFail($id);
    $notification->ReadAt = now();
    $notification->save();

    return response()->json(['success' => true]);
  }

  public function markUnread($id)
  {
    $notification = ZCompELearnNotificationMessage::findOrFail($id);
    $notification->ReadAt = null;
    $notification->save();

    return response()->json(['success' => true]);
  }

  public function deleteNotification($id)
  {
    $notification = ZCompELearnNotificationMessage::find($id);

    if (!$notification) {
        return response()->json(['message' => 'Notification not found'], 404);
    }

    $notification->delete();

    return response()->json(['message' => 'Notification deleted successfully'], 200);
  }
}
