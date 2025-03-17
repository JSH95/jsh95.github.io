import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import "../../config/index.css";

const ScheduleCalendar = ({ schedules }) => {
    const [selectedEvent, setSelectedEvent] = useState(null);

    const events = schedules.map((schedule) => ({
        id: schedule.id,  // ID를 추가하여 이벤트를 구분할 수 있게 함
        title: schedule.name, // 일정명만 설정
        start: schedule.startDateTime,
        end: schedule.endDateTime,
        allDay: true,
        extendedProps: {
            scheduleInfo: schedule.scheduleInfo,
            scheduleType: schedule.scheduleType,
            institutionId: schedule.institutionId,
            institutionName: schedule.institution.name,
        },
        display: 'list-item',  // 시간 없이 제목만 표시
    }));

    const handleEventClick = (info) => {
        const eventDetails = {
            id: info.event.id,
            title: info.event.title,
            scheduleInfo: info.event.extendedProps.scheduleInfo,
            start: info.event.start ? info.event.start.toLocaleDateString() : '-',
            startTime: info.event.start
                ? info.event.start.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                : '-',
            end: info.event.end ? info.event.end.toLocaleDateString() : '-',
            endTime: info.event.end
                ? info.event.end.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                : '-',
            scheduleType: info.event.extendedProps.scheduleType,
            institutionId: info.event.extendedProps.institutionId,
            institutionName: info.event.extendedProps.institutionName,  // 교육기관명은 서버에서 받아온 데이터로 대체

        };

        setSelectedEvent(eventDetails);

        let periodDisplay = '';
        if (eventDetails.start !== eventDetails.end && eventDetails.startTime === eventDetails.endTime) {
            // 기간이 다르면
            periodDisplay = `<p><strong>기간:</strong> ${eventDetails.start} ~ ${eventDetails.end}</p>`;
        } else if (eventDetails.start === eventDetails.end && eventDetails.startTime !== eventDetails.endTime) {
            // 기간은 같고 시간은 다르면
            periodDisplay = `<p><strong>기간:</strong> ${eventDetails.start} ~ ${eventDetails.end}</p>
                             <p><strong>시간:</strong> ${eventDetails.startTime} ~ ${eventDetails.endTime}</p>`;
        } else {
            // 기간과 시간이 같으면
            periodDisplay = `<p><strong>기간:</strong> ${eventDetails.start}</p>
                             <p><strong>시간:</strong> 종일</p>`;
        }


        // 새 창을 열고, 모달 내용을 새 창에 표시
        const newWindow = window.open('', '_blank', 'width=400,height=400,left=200,top=200'); // 크기와 위치 지정
        newWindow.document.write(`
            <html>
                <head><title>상세 일정</title></head>
                <body>
                    <h2>상세 일정</h2>
                    <p><strong>이름:</strong> ${eventDetails.title}</p>
                    <p><strong>교육기관: </strong>${eventDetails.institutionName}</p>
                     <p><strong>유형:</strong> ${eventDetails.scheduleType}</p>
                    <p><strong>일정 정보:</strong> ${eventDetails.scheduleInfo}</p>
                   
                    ${periodDisplay}
                     <button 
                    id="deleteBtn"
                    style="
                    padding: 12px; 
                    background-color: #ff0a0a; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    font-size: 16px; 
                    cursor: pointer; 
                    font-weight: bold; 
                    transition: background-color 0.3s ease; 
                    margin: 10px 10px; 
                    text-align: center; 
                    float: right; 
                    flex-shrink: 0;" >삭제</button>
                     <button 
                    id="editBtn"
                    style="
                    padding: 12px; 
                    background-color: #007bff; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    font-size: 16px; 
                    cursor: pointer; 
                    font-weight: bold; 
                    transition: background-color 0.3s ease; 
                    margin: 10px 10px; 
                    text-align: center; 
                    float: left; 
                    flex-shrink: 0;" >수정</button>
                    <button 
                    style="
                    padding: 12px; 
                    background-color: #4caf50; 
                    color: white; 
                    border: none; 
                    border-radius: 4px; 
                    font-size: 16px; 
                    cursor: pointer; 
                    font-weight: bold; 
                    transition: background-color 0.3s ease; 
                    margin: 10px 10px; 
                    text-align: center; 
                    float: left; 
                    flex-shrink: 0;"
                    onclick="window.close()" >닫기</button>
                    <script>
                        document.getElementById('editBtn').addEventListener('click', function() {
                            const editUrl = 
                            '/#/personnel/institution/${eventDetails.institutionId}/schedule/${eventDetails.id}'; 
                            // 수정 페이지 URL
                            window.opener.location.href = editUrl; // 부모 창의 URL 변경
                            window.close(); // 현재 창 닫기
                        });
                    </script>
                    <script>
                    document.getElementById('deleteBtn').addEventListener('click', function() {
                       if (confirm('정말로 이 일정을 삭제하시겠습니까?')) {
                            window.opener.postMessage(
                            {
                                type: 'deleteSchedule',
                                institutionId: '${eventDetails.institutionId}',
                                scheduleId: '${eventDetails.id}',
                            },
                                '*'
                                );
                            window.close(); // 현재 창 닫기
                        }
                    });
                    </script>
                </body>
            </html>
        `);
    };

    return (
        <div>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: '',
                }}
                events={events}
                eventClick={handleEventClick}  // 클릭 이벤트 처리기 등록

            />
        </div>
    );
};

export default ScheduleCalendar;
