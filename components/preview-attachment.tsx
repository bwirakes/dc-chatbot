import type { Attachment } from 'ai';

import { LoaderIcon, FileIcon, ImageIcon } from './icons';

// Helper function to get appropriate icon for file type
const getFileIcon = (contentType: string) => {
  if (contentType.startsWith('image')) {
    return <ImageIcon />;
  } else if (contentType === 'application/pdf') {
    return <FileIcon />;
  } else if (
    contentType === 'application/msword' || 
    contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return <FileIcon />;
  } else {
    return <FileIcon />;
  }
};

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;

  return (
    <div data-testid="input-attachment-preview" className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
        {contentType ? (
          contentType.startsWith('image') ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center">
              {getFileIcon(contentType)}
              <span className="text-xs ml-1 text-zinc-500">
                {contentType === 'application/pdf' ? 'PDF' : 
                 contentType.includes('word') ? 'DOC' : 'File'}
              </span>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center">
            <FileIcon />
            <span className="text-xs ml-1 text-zinc-500">File</span>
          </div>
        )}

        {isUploading && (
          <div
            data-testid="input-attachment-loader"
            className="animate-spin absolute text-zinc-500"
          >
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-xs text-zinc-500 max-w-16 truncate">{name}</div>
    </div>
  );
};
