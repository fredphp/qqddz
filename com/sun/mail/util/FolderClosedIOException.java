package com.sun.mail.util;

import java.io.IOException;
import javax.mail.Folder;

public class FolderClosedIOException extends IOException
{
  private static final long serialVersionUID = 4281122580365555735L;
  private transient Folder folder;

  public FolderClosedIOException(Folder paramFolder)
  {
    this(paramFolder, null);
  }

  public FolderClosedIOException(Folder paramFolder, String paramString)
  {
    super(paramString);
    this.folder = paramFolder;
  }

  public Folder getFolder()
  {
    return this.folder;
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.util.FolderClosedIOException
 * JD-Core Version:    0.6.2
 */