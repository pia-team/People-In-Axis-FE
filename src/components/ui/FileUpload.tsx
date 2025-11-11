import React, { useRef, useState, useEffect } from 'react';
import { Box, Button, Typography, Chip } from '@mui/material';
import { CloudUpload as UploadIcon, Delete as DeleteIcon, AttachFile as FileIcon } from '@mui/icons-material';

interface FileUploadProps {
  label?: string;
  multiple?: boolean;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  onFilesChange: (files: File[]) => void;
  value?: File[];
}

const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload Files',
  multiple = true,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 10,
  disabled,
  onFilesChange,
  value = []
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>(value);

  useEffect(() => {
    setFiles(value || []);
  }, [value]);

  const handleBrowse = () => inputRef.current?.click();

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const filtered = selected.filter((f) => f.size <= maxSizeMB * 1024 * 1024);
    const merged = multiple ? [...files, ...filtered] : filtered.slice(0, 1);
    setFiles(merged);
    onFilesChange(merged);
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    onFilesChange(updated);
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <Button
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={handleBrowse}
        disabled={disabled}
      >
        {label}
      </Button>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        Max size: {maxSizeMB}MB • Accepted: {accept}
      </Typography>

      {files.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {files.map((file, idx) => (
            <Chip
              key={`${file.name}-${idx}`}
              icon={<FileIcon />}
              label={`${file.name} • ${(file.size / 1024 / 1024).toFixed(2)}MB`}
              onDelete={() => removeFile(idx)}
              deleteIcon={<DeleteIcon />}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
