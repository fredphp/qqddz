package javax.mail;

import java.util.Vector;
import javax.mail.event.FolderEvent;
import javax.mail.event.FolderListener;
import javax.mail.event.StoreEvent;
import javax.mail.event.StoreListener;

public abstract class Store extends Service
{
  private volatile Vector folderListeners = null;
  private volatile Vector storeListeners = null;

  protected Store(Session paramSession, URLName paramURLName)
  {
    super(paramSession, paramURLName);
  }

  public void addFolderListener(FolderListener paramFolderListener)
  {
    try
    {
      if (this.folderListeners == null)
        this.folderListeners = new Vector();
      this.folderListeners.addElement(paramFolderListener);
      return;
    }
    finally
    {
    }
  }

  public void addStoreListener(StoreListener paramStoreListener)
  {
    try
    {
      if (this.storeListeners == null)
        this.storeListeners = new Vector();
      this.storeListeners.addElement(paramStoreListener);
      return;
    }
    finally
    {
    }
  }

  public abstract Folder getDefaultFolder()
    throws MessagingException;

  public abstract Folder getFolder(String paramString)
    throws MessagingException;

  public abstract Folder getFolder(URLName paramURLName)
    throws MessagingException;

  public Folder[] getPersonalNamespaces()
    throws MessagingException
  {
    Folder[] arrayOfFolder = new Folder[1];
    arrayOfFolder[0] = getDefaultFolder();
    return arrayOfFolder;
  }

  public Folder[] getSharedNamespaces()
    throws MessagingException
  {
    return new Folder[0];
  }

  public Folder[] getUserNamespaces(String paramString)
    throws MessagingException
  {
    return new Folder[0];
  }

  protected void notifyFolderListeners(int paramInt, Folder paramFolder)
  {
    if (this.folderListeners == null)
      return;
    queueEvent(new FolderEvent(this, paramFolder, paramInt), this.folderListeners);
  }

  protected void notifyFolderRenamedListeners(Folder paramFolder1, Folder paramFolder2)
  {
    if (this.folderListeners == null)
      return;
    queueEvent(new FolderEvent(this, paramFolder1, paramFolder2, 3), this.folderListeners);
  }

  protected void notifyStoreListeners(int paramInt, String paramString)
  {
    if (this.storeListeners == null)
      return;
    queueEvent(new StoreEvent(this, paramInt, paramString), this.storeListeners);
  }

  public void removeFolderListener(FolderListener paramFolderListener)
  {
    try
    {
      if (this.folderListeners != null)
        this.folderListeners.removeElement(paramFolderListener);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void removeStoreListener(StoreListener paramStoreListener)
  {
    try
    {
      if (this.storeListeners != null)
        this.storeListeners.removeElement(paramStoreListener);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Store
 * JD-Core Version:    0.6.2
 */