import React, { useState, useEffect, useRef } from "react";
import { useRoom } from "../../hooks/useRoom"; //방 정보를 가져오는 hook
import { useAuth } from "../../contexts/AuthContext"; // 사용자 인증
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import RoomInfo from "../../components/RoomInfo";
import MemberList from "../../components/MemberList";
import io from "socket.io-client"; // socket.io-client 라이브러리

// 칸반 보드의 각 카드를 나타내는 인터페이스
interface KanbanCard {
  id: string; // 카드의 고유 식별자
  content: string; // 카드의 내용
  profile: string; // 카드 작성자의 프로필 이미지 URL
}

// 칸반 보드의 각 열(Section)을 나타내는 인터페이스
interface KanbanSection {
  id: string; // 열의 고유 식별자
  title: string; // 열의 제목 (예: "생성", "고민", "채택")
  cards: KanbanCard[]; // 해당 열에 속한 카드들의 배열
}

// KanbanBoard 컴포넌트의 props 인터페이스
interface KanbanBoardProps {
  roomId: string; // 현재 방의 ID
}

interface Member {
  nickname: string;
  job: string;
  profile: string;
  role: "host" | "guest";
}
const KanbanBoard: React.FC<KanbanBoardProps> = ({ roomId }) => {
  // 칸반 보드의 상태를 관리하는 state
  const { user } = useAuth(); // 현재 로그인된 사용자 정보 가져오기
  const { room, loading, error, fetchRoom } = useRoom(roomId); // 방 정보 훅
  const [members, setMembers] = useState<Member[]>([]); // 멤버 상태

  const [sections, setSections] = useState<KanbanSection[]>([
    { id: "Section-1", title: "생성", cards: [] },
    { id: "Section-2", title: "고민", cards: [] },
    { id: "Section-3", title: "채택", cards: [] },
  ]);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newCardContent, setNewCardContent] = useState("");
  const [addingCardTo, setAddingCardTo] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // socket.io 연결 설정
  const socket = useRef<ReturnType<typeof io> | null>(null); // socket.io 연결을 관리하는 ref
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionInputRef = useRef<HTMLInputElement>(null);

  // useEffect hook: roomId, user가 변경될 때만 useEffect hook을 실행
  useEffect(() => {
    if (roomId && user) {
      fetchRoom(roomId); // 방 정보 로드

      // WebSocket 연결 초기화
      socket.current = io("http://localhost:5000", {
        transports: ["websocket"], // WebSocket을 우선 사용
      });

      // WebSocket 서버에 연결 성공시
      socket.current.on("connect", () => {
        console.log("Connected to the WebSocket server");
        socket.current?.emit("joinRoom", { roomId, userId: user.id }); // 방에 참여
      });

      // 서버로부터 멤버 업데이트 수신
      socket.current.on("memberUpdate", (updatedMembers) => {
        console.log("Received member update:", updatedMembers); // 로그로 데이터 확인
        setMembers(updatedMembers); // 멤버 리스트를 상태에 저장
      });

      socket.current.on("boardUpdate", (updatedSections) => {
        console.log("Received board update:", updatedSections);
        setSections(updatedSections);
      });

      socket.current.on("connect_error", (error) => {
        console.error("Connection error:", error);
        // 에러 처리 로직
      });

      socket.current.on("reconnect", (attemptNumber) => {
        console.log("Reconnected on attempt: ", attemptNumber);
        // 재연결 성공 시 로직
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect(); // WebSocket 연결 해제
        }
      };
    }
  }, [roomId, user, fetchRoom]); // roomId와 user가 변경될 때마다 실행

  // 드래그 앤 드롭이 끝났을 때 실행되는 함수
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // 유효하지 않은 목적지인 경우 (예: 보드 밖으로 드래그) 함수 종료
    if (!destination) return;

    const newSections = Array.from(sections);
    const sourceSection = newSections.find(
      (section) => section.id === source.droppableId
    );
    const destSection = newSections.find(
      (section) => section.id === destination.droppableId
    );

    if (sourceSection && destSection) {
      const [movedCard] = sourceSection.cards.splice(source.index, 1);
      destSection.cards.splice(destination.index, 0, movedCard);
      setSections(newSections);

      socket.current?.emit("boardUpdate", { roomId, sections: newSections });
    }
  };

  // 새 카드 추가 함수
  const addCard = (sectionId: string, content: string) => {
    if (content.trim() && user) {
      const newCard: KanbanCard = {
        id: Date.now().toString(),
        content: content,
        profile: user.profile,
      };

      const newSections = sections.map((section) =>
        section.id === sectionId
          ? { ...section, cards: [...section.cards, newCard] }
          : section
      );

      setSections(newSections);
      setAddingCardTo(null);
      setNewCardContent("");

      socket.current?.emit("boardUpdate", { roomId, sections: newSections });
    }
  };
  // 카드 추가 버튼 클릭 핸들러
  const handleAddCardClick = (sectionId: string) => {
    setAddingCardTo(sectionId);
    setNewCardContent("");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // 카드 내용 입력 핸들러
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCardContent(e.target.value.slice(0, 80));
  };
  // 카드 입력 키 이벤트 핸들러
  const handleCardInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    sectionId: string
  ) => {
    if (e.key === "Enter" && newCardContent.trim()) {
      addCard(sectionId, newCardContent);
    } else if (e.key === "Escape") {
      setAddingCardTo(null);
    }
  };
  // 섹션 제목 클릭 핸들러
  const handleSectionTitleClick = (sectionId: string, currentTitle: string) => {
    setEditingSectionId(sectionId);
    setNewSectionTitle(currentTitle);
    setTimeout(() => {
      if (sectionInputRef.current) {
        sectionInputRef.current.focus();
        sectionInputRef.current.select(); // 기존 텍스트를 선택 상태로 만듭니다
      }
    }, 0);
  };

  // 섹션 제목 변경 핸들러
  const handleSectionTitleChange = (sectionId: string, newTitle: string) => {
    if (newTitle.trim() === "") return; // 빈 문자열이면 변경하지 않습니다

    const newSections = sections.map((section) =>
      section.id === sectionId
        ? { ...section, title: newTitle.trim() }
        : section
    );
    setSections(newSections);
    setEditingSectionId(null);
    setNewCardContent(""); // 입력 필드를 비웁니다

    socket.current?.emit("boardUpdate", { roomId, sections: newSections });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const roomInfoProps = room
    ? {
        title: room.title,
        creator: {
          name: room.nickname,
          job: "Unknown", // job 정보가 없으므로 "Unknown"으로 설정
        },
        participants: room.participants,
        maxParticipants: room.max_member,
        openTime: room.createdAt,
        closeTime: new Date(
          new Date(room.createdAt).getTime() + room.duration * 60000
        ).toISOString(),
        keywords: room.keywords,
        duration: room.duration,
      }
    : null;

  return (
    <div className="container mx-auto px-4 mt-5 flex flex-grow h-screen">
      <div className="flex flex-col w-[100%]">
        <div className="flex-grow border-4  border-yellow-200 p-2 rounded-3xl">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex">
              {sections.map((section) => (
                <div key={section.id} className="flex-1 px-2">
                  <div className="border-2 border-yellow-200 rounded-2xl flex justify-center m-1 pt-3 bg-white">
                    {editingSectionId === section.id ? (
                      <input
                        ref={sectionInputRef}
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        onBlur={() => {
                          handleSectionTitleChange(section.id, newSectionTitle);
                          setEditingSectionId(null);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleSectionTitleChange(
                              section.id,
                              newSectionTitle
                            );
                            setEditingSectionId(null);
                          }
                        }}
                        className="text-center mb-3 focus:outline-none w-full"
                      />
                    ) : (
                      <h5
                        className="text-center mb-3 cursor-pointer"
                        onClick={() =>
                          handleSectionTitleClick(section.id, section.title)
                        }
                      >
                        {section.title}
                      </h5>
                    )}
                  </div>
                  <Droppable droppableId={section.id}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[500px]"
                      >
                        {section.cards.map((card, index) => (
                          <Draggable
                            key={card.id}
                            draggableId={card.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2 bg-yellow-100 border border-yellow-300 rounded shadow-md p-2 flex items-center"
                              >
                                <p className="flex-grow">{card.content}</p>
                                <img
                                  src={card.profile}
                                  alt="User profile"
                                  className="w-8 h-8 rounded-full ml-2"
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {section.id === "Section-1" &&
                          (addingCardTo === section.id ? (
                            <div className="mb-2 bg-yellow-100 border border-yellow-300 rounded shadow-md p-2">
                              <input
                                ref={inputRef}
                                type="text"
                                placeholder="새 카드 내용 (80자 이내)"
                                value={newCardContent}
                                onChange={handleCardInputChange}
                                onKeyDown={(e) =>
                                  handleCardInputKeyPress(e, section.id)
                                }
                                className="w-full bg-transparent border-none focus:outline-none"
                              />
                              <small className="text-gray-600 text-right block">
                                {newCardContent.length} / 80
                              </small>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleAddCardClick(section.id)}
                                className="bg-white text-gray-800 font-bold py-2 px-4 rounded border border-gray-300 hover:bg-gray-100"
                              >
                                + 카드 추가
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>

        <div className="w-full p-4 h-[120px] bg-gray-300 border-yellow-300 rounded-2xl">
          {roomInfoProps && <RoomInfo {...roomInfoProps} />}
        </div>
      </div>
      <div className="flex flex-col w-[256px] p-4 border border-yellow-300 rounded-2xl">
        <MemberList />
      </div>
    </div>
  );
};

export default KanbanBoard;
