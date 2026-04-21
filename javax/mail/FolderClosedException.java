package javax.mail;

public class FolderClosedException extends MessagingException
{
  private static final long serialVersionUID = 1687879213433302315L;
  private transient Folder folder;

  public FolderClosedException(Folder paramFolder)
  {
    this(paramFolder, null);
  }

  public FolderClosedException(Folder paramFolder, String paramString)
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
 * Qualified Name:     javax.mail.FolderClosedException
 * JD-Core Version:    0.6.2
 */