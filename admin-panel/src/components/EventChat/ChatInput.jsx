import { useState, useRef } from 'react';
import { uploadChatFile } from '../../services/api';

function ChatInput({ onSend, disabled, sending }) {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (disabled || sending || uploading) return;

    // If there's a file, upload it first
    if (selectedFile) {
      await handleSendWithFile();
    } else if (inputText.trim()) {
      // Just send text
      onSend(inputText, null);
      setInputText('');
    }
  };

  const handleSendWithFile = async () => {
    try {
      setUploading(true);

      // Upload file
      const uploadRes = await uploadChatFile(selectedFile);
      const fileData = uploadRes.data.data;

      // Determine message type based on file
      let messageType = 'file';
      if (fileData.fileType.startsWith('image/')) {
        messageType = 'image';
      } else if (fileData.fileType.startsWith('audio/')) {
        messageType = 'audio';
      }

      // Send message with attachment
      onSend(inputText || fileData.fileName, {
        messageType,
        attachments: [fileData]
      });

      // Clear inputs
      setInputText('');
      setSelectedFile(null);
      setUploading(false);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
      setUploading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFile(audioFile);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('audio/')) return '🎤';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word') || file.type.includes('doc')) return '📝';
    if (file.type.includes('excel') || file.type.includes('sheet')) return '📊';
    return '📎';
  };

  return (
    <div className="chat-input-container">
      {/* File Preview */}
      {selectedFile && (
        <div className="file-preview">
          <div className="file-preview-content">
            <span className="file-icon">{getFileIcon(selectedFile)}</span>
            <span className="file-name">{selectedFile.name}</span>
            <button className="file-remove" onClick={handleRemoveFile}>
              ✕
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input-form">
        {/* File Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="image/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <button
          type="button"
          className="input-action-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || recording}
          title="Attach file"
        >
          📎
        </button>

        {/* Voice Recording Button */}
        <button
          type="button"
          className={`input-action-btn ${recording ? 'recording' : ''}`}
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled || selectedFile !== null}
          title={recording ? 'Stop recording' : 'Record voice note'}
        >
          {recording ? '⏹️' : '🎤'}
        </button>

        {/* Text Input */}
        <textarea
          className="chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Connecting...'
              : selectedFile
              ? 'Add a caption (optional)...'
              : 'Type a message...'
          }
          disabled={disabled || recording}
          rows={1}
          maxLength={5000}
        />

        {/* Send Button */}
        <button
          type="submit"
          className="chat-send-btn"
          disabled={disabled || (!inputText.trim() && !selectedFile) || uploading}
          title="Send message"
        >
          {uploading ? '⏳' : sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}

export default ChatInput;
