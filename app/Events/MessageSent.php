<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        // $this->message = $message;
        $this->message = $message->load('sender');
    }
    // l-Channel li ghadi n-broadcasting fiha
    public function broadcastOn()
    {
        // return new PresenceChannel('chat.' . $this->message->receiver_id);// PresenceChannel bach nchoufo chkon li online

        return new PresenceChannel(
            'chat.' . min($this->message->sender_id, $this->message->receiver_id) . '.' . // hna kankhlihem chat real time binathem 
                max($this->message->sender_id, $this->message->receiver_id)
        );
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }

    // public function broadcastWith()
    // {
    //     return [
    //         'id' => $this->message->id,
    //         'sender_id' => $this->message->sender_id,
    //         'content' => $this->message->content,
    //         'created_at' => $this->message->created_at,
    //     ];
    // }

    public function broadcastWith(): array
    {
        return [
            'message' => $this->message
        ];
    }
}
