export const getCheckStateText = (checkStates) => {
    if (!checkStates || checkStates.length === 0)
        return "미확인";
    if (checkStates.includes("수정요청") || checkStates.includes("재수정요청")) {
        return "수정 요청";
    } else if (checkStates.includes("재제출") || checkStates.includes("재재제출")) {
        return "제출 중";
    } else if (checkStates.includes("신청중")) {
        return "제출 중";
    } else if (checkStates.includes("승인완료")) {
        return "승인 완료";
    } else {
        return "미제출";
    }
};
