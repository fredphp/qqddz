package javax.mail;

public class ReadOnlyFolderException extends MessagingException
{
  private static final long serialVersionUID = 5711829372799039325L;
  private transient Folder folder;

  public ReadOnlyFolderException(Folder paramFolder)
  {
    this(paramFolder, null);
  }

  public ReadOnlyFolderException(Folder paramFolder, String paramString)
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
 * Qualified Name:     javax.mail.ReadOnlyFolderException
 * JD-Core Version:    0.6.2
 */