package javax.mail;

import java.util.Vector;
import javax.mail.event.ConnectionEvent;
import javax.mail.event.ConnectionListener;
import javax.mail.event.FolderEvent;
import javax.mail.event.FolderListener;
import javax.mail.event.MailEvent;
import javax.mail.event.MessageChangedEvent;
import javax.mail.event.MessageChangedListener;
import javax.mail.event.MessageCountEvent;
import javax.mail.event.MessageCountListener;
import javax.mail.search.SearchTerm;

public abstract class Folder
{
  public static final int HOLDS_FOLDERS = 2;
  public static final int HOLDS_MESSAGES = 1;
  public static final int READ_ONLY = 1;
  public static final int READ_WRITE = 2;
  private volatile Vector connectionListeners = null;
  private volatile Vector folderListeners = null;
  private volatile Vector messageChangedListeners = null;
  private volatile Vector messageCountListeners = null;
  protected int mode = -1;
  private EventQueue q;
  private Object qLock = new Object();
  protected Store store;

  protected Folder(Store paramStore)
  {
    this.store = paramStore;
  }

  private void queueEvent(MailEvent paramMailEvent, Vector paramVector)
  {
    synchronized (this.qLock)
    {
      if (this.q == null)
        this.q = new EventQueue();
      Vector localVector = (Vector)paramVector.clone();
      this.q.enqueue(paramMailEvent, localVector);
      return;
    }
  }

  private void terminateQueue()
  {
    synchronized (this.qLock)
    {
      if (this.q != null)
      {
        Vector localVector = new Vector();
        localVector.setSize(1);
        this.q.enqueue(new TerminatorEvent(), localVector);
        this.q = null;
      }
      return;
    }
  }

  public void addConnectionListener(ConnectionListener paramConnectionListener)
  {
    try
    {
      if (this.connectionListeners == null)
        this.connectionListeners = new Vector();
      this.connectionListeners.addElement(paramConnectionListener);
      return;
    }
    finally
    {
    }
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

  public void addMessageChangedListener(MessageChangedListener paramMessageChangedListener)
  {
    try
    {
      if (this.messageChangedListeners == null)
        this.messageChangedListeners = new Vector();
      this.messageChangedListeners.addElement(paramMessageChangedListener);
      return;
    }
    finally
    {
    }
  }

  public void addMessageCountListener(MessageCountListener paramMessageCountListener)
  {
    try
    {
      if (this.messageCountListeners == null)
        this.messageCountListeners = new Vector();
      this.messageCountListeners.addElement(paramMessageCountListener);
      return;
    }
    finally
    {
    }
  }

  public abstract void appendMessages(Message[] paramArrayOfMessage)
    throws MessagingException;

  public abstract void close(boolean paramBoolean)
    throws MessagingException;

  public void copyMessages(Message[] paramArrayOfMessage, Folder paramFolder)
    throws MessagingException
  {
    if (!paramFolder.exists())
      throw new FolderNotFoundException(paramFolder.getFullName() + " does not exist", paramFolder);
    paramFolder.appendMessages(paramArrayOfMessage);
  }

  public abstract boolean create(int paramInt)
    throws MessagingException;

  public abstract boolean delete(boolean paramBoolean)
    throws MessagingException;

  public abstract boolean exists()
    throws MessagingException;

  public abstract Message[] expunge()
    throws MessagingException;

  public void fetch(Message[] paramArrayOfMessage, FetchProfile paramFetchProfile)
    throws MessagingException
  {
  }

  protected void finalize()
    throws Throwable
  {
    super.finalize();
    terminateQueue();
  }

  // ERROR //
  public int getDeletedMessageCount()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 144	javax/mail/Folder:isOpen	()Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifne +9 -> 17
    //   11: iconst_m1
    //   12: istore_3
    //   13: aload_0
    //   14: monitorexit
    //   15: iload_3
    //   16: ireturn
    //   17: iconst_0
    //   18: istore_3
    //   19: aload_0
    //   20: invokevirtual 147	javax/mail/Folder:getMessageCount	()I
    //   23: istore 4
    //   25: iconst_1
    //   26: istore 5
    //   28: iload 5
    //   30: iload 4
    //   32: if_icmpgt -19 -> 13
    //   35: aload_0
    //   36: iload 5
    //   38: invokevirtual 151	javax/mail/Folder:getMessage	(I)Ljavax/mail/Message;
    //   41: getstatic 157	javax/mail/Flags$Flag:DELETED	Ljavax/mail/Flags$Flag;
    //   44: invokevirtual 163	javax/mail/Message:isSet	(Ljavax/mail/Flags$Flag;)Z
    //   47: istore 7
    //   49: iload 7
    //   51: ifeq +6 -> 57
    //   54: iinc 3 1
    //   57: iinc 5 1
    //   60: goto -32 -> 28
    //   63: astore_1
    //   64: aload_0
    //   65: monitorexit
    //   66: aload_1
    //   67: athrow
    //   68: astore 6
    //   70: goto -13 -> 57
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	63	finally
    //   19	25	63	finally
    //   35	49	63	finally
    //   35	49	68	javax/mail/MessageRemovedException
  }

  public abstract Folder getFolder(String paramString)
    throws MessagingException;

  public abstract String getFullName();

  public abstract Message getMessage(int paramInt)
    throws MessagingException;

  public abstract int getMessageCount()
    throws MessagingException;

  public Message[] getMessages()
    throws MessagingException
  {
    try
    {
      if (!isOpen())
        throw new IllegalStateException("Folder not open");
    }
    finally
    {
    }
    int i = getMessageCount();
    Message[] arrayOfMessage = new Message[i];
    for (int j = 1; ; j++)
    {
      if (j > i)
        return arrayOfMessage;
      int k = j - 1;
      arrayOfMessage[k] = getMessage(j);
    }
  }

  public Message[] getMessages(int paramInt1, int paramInt2)
    throws MessagingException
  {
    int i = 1 + (paramInt2 - paramInt1);
    try
    {
      Message[] arrayOfMessage = new Message[i];
      for (int j = paramInt1; ; j++)
      {
        if (j > paramInt2)
          return arrayOfMessage;
        int k = j - paramInt1;
        arrayOfMessage[k] = getMessage(j);
      }
    }
    finally
    {
    }
  }

  public Message[] getMessages(int[] paramArrayOfInt)
    throws MessagingException
  {
    try
    {
      int i = paramArrayOfInt.length;
      Message[] arrayOfMessage = new Message[i];
      for (int j = 0; ; j++)
      {
        if (j >= i)
          return arrayOfMessage;
        arrayOfMessage[j] = getMessage(paramArrayOfInt[j]);
      }
    }
    finally
    {
    }
  }

  public int getMode()
  {
    if (!isOpen())
      throw new IllegalStateException("Folder not open");
    return this.mode;
  }

  public abstract String getName();

  // ERROR //
  public int getNewMessageCount()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 144	javax/mail/Folder:isOpen	()Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifne +9 -> 17
    //   11: iconst_m1
    //   12: istore_3
    //   13: aload_0
    //   14: monitorexit
    //   15: iload_3
    //   16: ireturn
    //   17: iconst_0
    //   18: istore_3
    //   19: aload_0
    //   20: invokevirtual 147	javax/mail/Folder:getMessageCount	()I
    //   23: istore 4
    //   25: iconst_1
    //   26: istore 5
    //   28: iload 5
    //   30: iload 4
    //   32: if_icmpgt -19 -> 13
    //   35: aload_0
    //   36: iload 5
    //   38: invokevirtual 151	javax/mail/Folder:getMessage	(I)Ljavax/mail/Message;
    //   41: getstatic 179	javax/mail/Flags$Flag:RECENT	Ljavax/mail/Flags$Flag;
    //   44: invokevirtual 163	javax/mail/Message:isSet	(Ljavax/mail/Flags$Flag;)Z
    //   47: istore 7
    //   49: iload 7
    //   51: ifeq +6 -> 57
    //   54: iinc 3 1
    //   57: iinc 5 1
    //   60: goto -32 -> 28
    //   63: astore_1
    //   64: aload_0
    //   65: monitorexit
    //   66: aload_1
    //   67: athrow
    //   68: astore 6
    //   70: goto -13 -> 57
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	63	finally
    //   19	25	63	finally
    //   35	49	63	finally
    //   35	49	68	javax/mail/MessageRemovedException
  }

  public abstract Folder getParent()
    throws MessagingException;

  public abstract Flags getPermanentFlags();

  public abstract char getSeparator()
    throws MessagingException;

  public Store getStore()
  {
    return this.store;
  }

  public abstract int getType()
    throws MessagingException;

  public URLName getURLName()
    throws MessagingException
  {
    URLName localURLName = getStore().getURLName();
    String str = getFullName();
    StringBuffer localStringBuffer = new StringBuffer();
    getSeparator();
    if (str != null)
      localStringBuffer.append(str);
    return new URLName(localURLName.getProtocol(), localURLName.getHost(), localURLName.getPort(), localStringBuffer.toString(), localURLName.getUsername(), null);
  }

  // ERROR //
  public int getUnreadMessageCount()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 144	javax/mail/Folder:isOpen	()Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifne +9 -> 17
    //   11: iconst_m1
    //   12: istore_3
    //   13: aload_0
    //   14: monitorexit
    //   15: iload_3
    //   16: ireturn
    //   17: iconst_0
    //   18: istore_3
    //   19: aload_0
    //   20: invokevirtual 147	javax/mail/Folder:getMessageCount	()I
    //   23: istore 4
    //   25: iconst_1
    //   26: istore 5
    //   28: iload 5
    //   30: iload 4
    //   32: if_icmpgt -19 -> 13
    //   35: aload_0
    //   36: iload 5
    //   38: invokevirtual 151	javax/mail/Folder:getMessage	(I)Ljavax/mail/Message;
    //   41: getstatic 226	javax/mail/Flags$Flag:SEEN	Ljavax/mail/Flags$Flag;
    //   44: invokevirtual 163	javax/mail/Message:isSet	(Ljavax/mail/Flags$Flag;)Z
    //   47: istore 7
    //   49: iload 7
    //   51: ifne +6 -> 57
    //   54: iinc 3 1
    //   57: iinc 5 1
    //   60: goto -32 -> 28
    //   63: astore_1
    //   64: aload_0
    //   65: monitorexit
    //   66: aload_1
    //   67: athrow
    //   68: astore 6
    //   70: goto -13 -> 57
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	63	finally
    //   19	25	63	finally
    //   35	49	63	finally
    //   35	49	68	javax/mail/MessageRemovedException
  }

  public abstract boolean hasNewMessages()
    throws MessagingException;

  public abstract boolean isOpen();

  public boolean isSubscribed()
  {
    return true;
  }

  public Folder[] list()
    throws MessagingException
  {
    return list("%");
  }

  public abstract Folder[] list(String paramString)
    throws MessagingException;

  public Folder[] listSubscribed()
    throws MessagingException
  {
    return listSubscribed("%");
  }

  public Folder[] listSubscribed(String paramString)
    throws MessagingException
  {
    return list(paramString);
  }

  protected void notifyConnectionListeners(int paramInt)
  {
    if (this.connectionListeners != null)
      queueEvent(new ConnectionEvent(this, paramInt), this.connectionListeners);
    if (paramInt == 3)
      terminateQueue();
  }

  protected void notifyFolderListeners(int paramInt)
  {
    if (this.folderListeners != null)
      queueEvent(new FolderEvent(this, this, paramInt), this.folderListeners);
    this.store.notifyFolderListeners(paramInt, this);
  }

  protected void notifyFolderRenamedListeners(Folder paramFolder)
  {
    if (this.folderListeners != null)
      queueEvent(new FolderEvent(this, this, paramFolder, 3), this.folderListeners);
    this.store.notifyFolderRenamedListeners(this, paramFolder);
  }

  protected void notifyMessageAddedListeners(Message[] paramArrayOfMessage)
  {
    if (this.messageCountListeners == null)
      return;
    queueEvent(new MessageCountEvent(this, 1, false, paramArrayOfMessage), this.messageCountListeners);
  }

  protected void notifyMessageChangedListeners(int paramInt, Message paramMessage)
  {
    if (this.messageChangedListeners == null)
      return;
    queueEvent(new MessageChangedEvent(this, paramInt, paramMessage), this.messageChangedListeners);
  }

  protected void notifyMessageRemovedListeners(boolean paramBoolean, Message[] paramArrayOfMessage)
  {
    if (this.messageCountListeners == null)
      return;
    queueEvent(new MessageCountEvent(this, 2, paramBoolean, paramArrayOfMessage), this.messageCountListeners);
  }

  public abstract void open(int paramInt)
    throws MessagingException;

  public void removeConnectionListener(ConnectionListener paramConnectionListener)
  {
    try
    {
      if (this.connectionListeners != null)
        this.connectionListeners.removeElement(paramConnectionListener);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
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

  public void removeMessageChangedListener(MessageChangedListener paramMessageChangedListener)
  {
    try
    {
      if (this.messageChangedListeners != null)
        this.messageChangedListeners.removeElement(paramMessageChangedListener);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void removeMessageCountListener(MessageCountListener paramMessageCountListener)
  {
    try
    {
      if (this.messageCountListeners != null)
        this.messageCountListeners.removeElement(paramMessageCountListener);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public abstract boolean renameTo(Folder paramFolder)
    throws MessagingException;

  public Message[] search(SearchTerm paramSearchTerm)
    throws MessagingException
  {
    return search(paramSearchTerm, getMessages());
  }

  public Message[] search(SearchTerm paramSearchTerm, Message[] paramArrayOfMessage)
    throws MessagingException
  {
    Vector localVector = new Vector();
    int i = 0;
    while (true)
    {
      if (i >= paramArrayOfMessage.length)
      {
        Message[] arrayOfMessage = new Message[localVector.size()];
        localVector.copyInto(arrayOfMessage);
        return arrayOfMessage;
      }
      try
      {
        if (paramArrayOfMessage[i].match(paramSearchTerm))
          localVector.addElement(paramArrayOfMessage[i]);
        label55: i++;
      }
      catch (MessageRemovedException localMessageRemovedException)
      {
        break label55;
      }
    }
  }

  // ERROR //
  public void setFlags(int paramInt1, int paramInt2, Flags paramFlags, boolean paramBoolean)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: iload_1
    //   3: istore 5
    //   5: iload 5
    //   7: iload_2
    //   8: if_icmple +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: aload_0
    //   15: iload 5
    //   17: invokevirtual 151	javax/mail/Folder:getMessage	(I)Ljavax/mail/Message;
    //   20: aload_3
    //   21: iload 4
    //   23: invokevirtual 312	javax/mail/Message:setFlags	(Ljavax/mail/Flags;Z)V
    //   26: iinc 5 1
    //   29: goto -24 -> 5
    //   32: astore 7
    //   34: aload_0
    //   35: monitorexit
    //   36: aload 7
    //   38: athrow
    //   39: astore 6
    //   41: goto -15 -> 26
    //
    // Exception table:
    //   from	to	target	type
    //   14	26	32	finally
    //   14	26	39	javax/mail/MessageRemovedException
  }

  // ERROR //
  public void setFlags(int[] paramArrayOfInt, Flags paramFlags, boolean paramBoolean)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: iconst_0
    //   3: istore 4
    //   5: aload_1
    //   6: arraylength
    //   7: istore 6
    //   9: iload 4
    //   11: iload 6
    //   13: if_icmplt +6 -> 19
    //   16: aload_0
    //   17: monitorexit
    //   18: return
    //   19: aload_0
    //   20: aload_1
    //   21: iload 4
    //   23: iaload
    //   24: invokevirtual 151	javax/mail/Folder:getMessage	(I)Ljavax/mail/Message;
    //   27: aload_2
    //   28: iload_3
    //   29: invokevirtual 312	javax/mail/Message:setFlags	(Ljavax/mail/Flags;Z)V
    //   32: iinc 4 1
    //   35: goto -30 -> 5
    //   38: astore 5
    //   40: aload_0
    //   41: monitorexit
    //   42: aload 5
    //   44: athrow
    //   45: astore 7
    //   47: goto -15 -> 32
    //
    // Exception table:
    //   from	to	target	type
    //   5	9	38	finally
    //   19	32	38	finally
    //   19	32	45	javax/mail/MessageRemovedException
  }

  // ERROR //
  public void setFlags(Message[] paramArrayOfMessage, Flags paramFlags, boolean paramBoolean)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: iconst_0
    //   3: istore 4
    //   5: aload_1
    //   6: arraylength
    //   7: istore 6
    //   9: iload 4
    //   11: iload 6
    //   13: if_icmplt +6 -> 19
    //   16: aload_0
    //   17: monitorexit
    //   18: return
    //   19: aload_1
    //   20: iload 4
    //   22: aaload
    //   23: aload_2
    //   24: iload_3
    //   25: invokevirtual 312	javax/mail/Message:setFlags	(Ljavax/mail/Flags;Z)V
    //   28: iinc 4 1
    //   31: goto -26 -> 5
    //   34: astore 5
    //   36: aload_0
    //   37: monitorexit
    //   38: aload 5
    //   40: athrow
    //   41: astore 7
    //   43: goto -15 -> 28
    //
    // Exception table:
    //   from	to	target	type
    //   5	9	34	finally
    //   19	28	34	finally
    //   19	28	41	javax/mail/MessageRemovedException
  }

  public void setSubscribed(boolean paramBoolean)
    throws MessagingException
  {
    throw new MethodNotSupportedException();
  }

  public String toString()
  {
    String str = getFullName();
    if (str != null)
      return str;
    return super.toString();
  }

  static class TerminatorEvent extends MailEvent
  {
    private static final long serialVersionUID = 3765761925441296565L;

    TerminatorEvent()
    {
      super();
    }

    public void dispatch(Object paramObject)
    {
      Thread.currentThread().interrupt();
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.Folder
 * JD-Core Version:    0.6.2
 */