package javax.mail.event;

import java.util.EventListener;

public abstract interface FolderListener extends EventListener
{
  public abstract void folderCreated(FolderEvent paramFolderEvent);

  public abstract void folderDeleted(FolderEvent paramFolderEvent);

  public abstract void folderRenamed(FolderEvent paramFolderEvent);
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.event.FolderListener
 * JD-Core Version:    0.6.2
 */