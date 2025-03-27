import React, { useState } from "react";
import createAxiosInstance from "../../config/api";
import {useNavigate, useParams} from "react-router-dom";
import {gapi} from "gapi-script";
import {useAuth} from "../../config/AuthContext";
export { FileUploadDownload as default };

export function FileUploadDownload(editedItem, setEditedItem) {
  const { username } = useAuth();
  const {Id} = useParams();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 업로드 진행 상태
  const [downloading, setDownloading] = useState(false);
  const [files, setFiles] = useState({
    resumeFileName1: [],
    resumeFileName2: [],
    resumeFileName3: []
  }); // 모든 파일 상태 관리
  // const [existingFile, setExistingFile]= useState(false);


  const handleFileChange = (event, type) => {

    const selectedFiles = Array.from(event.target.files);
    const existingFile =
        Array.isArray(editedItem.applicantFile) &&
        editedItem.applicantFile.find((file) => file.resumeType === type);

    if (existingFile) {
      const confirmUpload = window.confirm(
          `이미 ${existingFile.fileName} 파일이 저장되어 있습니다. 업로드를 진행하시겠습니까?`
      );

      if (!confirmUpload) {
        // 사용자가 취소를 누르면 파일 선택을 초기화
        event.target.value = null;
        return; // 업로드를 진행하지 않음
      }
    }

    setFiles((prevFiles) => ({
      ...prevFiles,
      [type]: selectedFiles, // 선택된 파일을 해당 타입에 저장
    }));
  };

  const handleUpload = async () => {
    if (files.resumeFileName1.length === 0 &&
        files.resumeFileName2.length === 0 &&
        files.resumeFileName3.length === 0) {
      alert("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    // 각 파일과 타입을 함께 전송
    files.resumeFileName1.forEach((file) => {
      formData.append("files", file);
      formData.append("resumeTypes", "resumeFileName1");
    });
    // resume2에 해당하는 파일을 추가
    files.resumeFileName2.forEach((file) => {
      formData.append("files", file);
      formData.append("resumeTypes", "resumeFileName2");
    });
    // resume3에 해당하는 파일을 추가
    files.resumeFileName3.forEach((file) => {
      formData.append("files", file);
      formData.append("resumeTypes", "resumeFileName3");
    });

    setUploading(true);
    setProgress(0); // 초기화

    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.post(`/personnel/applicant/${Id}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      alert("파일 업로드 성공!");

      setEditedItem((prev) => ({
        ...prev,
        applicantFile: response.data || [], // 데이터가 없으면 빈 배열
      }));

      //초기화
      setFiles({
        resumeFileName1: [],
        resumeFileName2: [],
        resumeFileName3: []
      });
    } catch (error) {
      // console.error("파일 업로드 실패:", error);
      alert("파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
      setProgress(0); // 업로드 완료 후 초기화
    }
  };

  //파일다운로드
  const handleDownload = async () => {
      setDownloading(true);
    setProgress(0); // 초기화
    try {
      const axiosInstance = createAxiosInstance();
      const response = await axiosInstance.get(`/personnel/applicant/${Id}/download`, {
        responseType: 'blob',  // 파일 데이터를 Blob 형태로 받음
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });
      // 파일 다운로드 실행
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      let fileName = editedItem.name + '이력서.zip';
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.alert('파일 다운로드 완료!')
    } catch (error) {
      window.alert('파일 다운로드 실패!');
    } finally {
        setDownloading(false);
      setProgress(0); // 초기화
    }
  };

  //id값을 가져와서 파일 삭제 쿼리 발송
  const fileDelete = async (fileId) => {
    const confirmDelete2 = window.confirm("파일을 삭제하시겠습니까?");
    if (!confirmDelete2) return;
    try {
      const axiosInstance = createAxiosInstance();
      await axiosInstance.delete(`/personnel/applicant/${fileId}/fileDelete`);
      alert("파일 삭제 성공!");
      setEditedItem((prevItem) => ({
        ...prevItem,
        applicantFile: prevItem.applicantFile.filter((file) => file.id !== fileId),
      }));
    } catch (error) {
      // console.error("파일 삭제 실패:", error);
      alert("파일 삭제 중 오류가 발생했습니다.");
    }

  }

  return {
    handleFileChange,
    handleUpload,
    handleDownload,
    uploading,
    progress,
    downloading,
    files,
    fileDelete,
  };
}

