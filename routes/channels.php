<?php


use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('chat.{id}', function ($user, $id) {
//     // only this id of this user can enter to this channel
//     return (int) $user->id === (int) $id;
// });

//only the user can listen to his own channel 
// Broadcast::channel('chat.{id}', function ($user, $id) {
//     if ((int) $user->id === (int) $id) {
//         return [
//             'id' => $user->id,
//             'name' => $user->name,
//         ];
//     }

//     return false;
// });
// here i let both of them listen to eachothers in one channel
Broadcast::channel('chat.{id1}.{id2}', function ($user, $id1, $id2) {
    return in_array($user->id, [(int)$id1, (int)$id2])
        ? ['id' => $user->id, 'name' => $user->name]
        : false;
});