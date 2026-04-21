package javax.mail;

public class FolderNotFoundException extends MessagingException
{
  private static final long serialVersionUID = 472612108891249403L;
  private transient Folder folder;

  public FolderNotFoundException()
  {
  }

  public FolderNotFoundException(String paramString, Folder paramFolder)
  {
    super(paramString);
    this.folder = paramFolder;
  }

  public FolderNotFoundException(Folder paramFolder)
  {
    this.folder = paramFolder;
  }

  public FolderNotFoundException(Folder paramFolder, String paramString)
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
 * Qualified Name:     javax.mail.FolderNotFoundException
 * JD-Core Version:    0.6.2
 */