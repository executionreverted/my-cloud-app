import { AutoSizer } from "react-virtualized"
import { useRef, useEffect, memo, useState } from "react";
import { VariableSizeList as List } from "react-window";
import { ChatMessage } from "./ChatMessage";
import { useRoom } from "../../hooks/useRoom";
import { ChatMessage as ChatMessageType } from "../../types/chat.types";
const Messages = memo(({ messageLength }: any) => {
    // References
    const listRef = useRef<List>(null);
    const rowHeights = useRef({});

    useEffect(() => {
        if (messageLength > 0) {
            console.log("scrolling to bottom ", messageLength)
            scrollToBottom();
        }
    }, [messageLength]);

    function getRowHeight(index) {
        return rowHeights.current[index] || 60;
    }

    function Row({ index, style }) {
        const [message, setMessage] = useState<ChatMessageType | null>(null)
        const [isLoading, setIsLoading] = useState(false)
        const { activeRoom } = useRoom()
        const rowRef = useRef({});
        const { getMessageFromRoom } = useRoom()
        useEffect(() => {
            setIsLoading(true)
            getMessageFromRoom(activeRoom?.seed, index).then((message) => {
                setMessage(message)
                setIsLoading(false)
            }).catch((error) => {
                setIsLoading(false)
            })
        }, [activeRoom?.seed, index])

        useEffect(() => {
            if (rowRef.current) {
                // Update the height once the message content is available
                const rowHeight = rowRef.current.clientHeight + 12; // Add padding/margin if necessary
                setRowHeight(index, rowHeight);
            }
        }, [message?.content, index, isLoading]);

        return (
            <ChatMessage messageLength={messageLength} isLoading={isLoading} message={message} rowRef={rowRef} style={style} />
        );
    }

    function setRowHeight(index: number, size: number) {
        rowHeights.current[index] = size;
        if (listRef.current) {
            listRef.current.resetAfterIndex(index); // Reset only the updated row
        }
    }

    function scrollToBottom() {
        listRef.current.scrollToItem(messageLength - 1, "end");
    }

    return (
        <AutoSizer style={{
            height: "100%",
            width: "100%"
        }}>
            {({ height, width }) => (
                <List
                    className="List"
                    height={height}
                    itemCount={messageLength}
                    itemSize={getRowHeight}
                    ref={listRef}
                    width={width}
                >
                    {Row}
                </List>
            )}
        </AutoSizer>
    );
});

export default Messages;
