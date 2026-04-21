package com.sun.mail.imap;

import com.sun.mail.iap.BadCommandException;
import com.sun.mail.iap.CommandFailedException;
import com.sun.mail.iap.ConnectionException;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.iap.Response;
import com.sun.mail.iap.ResponseHandler;
import com.sun.mail.imap.protocol.FetchResponse;
import com.sun.mail.imap.protocol.IMAPProtocol;
import com.sun.mail.imap.protocol.IMAPResponse;
import com.sun.mail.imap.protocol.ListInfo;
import com.sun.mail.imap.protocol.Status;
import com.sun.mail.imap.protocol.UID;
import java.io.PrintStream;
import java.util.Date;
import java.util.Hashtable;
import java.util.NoSuchElementException;
import java.util.Vector;
import javax.mail.FetchProfile;
import javax.mail.FetchProfile.Item;
import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.FolderClosedException;
import javax.mail.FolderNotFoundException;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Quota;
import javax.mail.Session;
import javax.mail.StoreClosedException;
import javax.mail.UIDFolder;

public class IMAPFolder extends Folder
  implements UIDFolder, ResponseHandler
{
  private static final int ABORTING = 2;
  private static final int IDLE = 1;
  private static final int RUNNING = 0;
  protected static final char UNKNOWN_SEPARATOR = 'èøø';
  protected String[] attributes;
  protected Flags availableFlags;
  private Status cachedStatus = null;
  private long cachedStatusTime = 0L;
  private boolean connectionPoolDebug;
  private boolean debug = false;
  private boolean doExpungeNotification = true;
  protected boolean exists = false;
  protected String fullName;
  private int idleState = 0;
  protected boolean isNamespace = false;
  protected Vector messageCache;
  protected Object messageCacheLock;
  protected String name;
  private boolean opened = false;
  private PrintStream out;
  protected Flags permanentFlags;
  protected IMAPProtocol protocol;
  private int realTotal = -1;
  private boolean reallyClosed = true;
  private int recent = -1;
  protected char separator;
  private int total = -1;
  protected int type;
  protected Hashtable uidTable;
  private long uidnext = -1L;
  private long uidvalidity = -1L;

  static
  {
    if (!IMAPFolder.class.desiredAssertionStatus());
    for (boolean bool = true; ; bool = false)
    {
      $assertionsDisabled = bool;
      return;
    }
  }

  protected IMAPFolder(ListInfo paramListInfo, IMAPStore paramIMAPStore)
  {
    this(paramListInfo.name, paramListInfo.separator, paramIMAPStore);
    if (paramListInfo.hasInferiors)
      this.type = (0x2 | this.type);
    if (paramListInfo.canOpen)
      this.type = (0x1 | this.type);
    this.exists = true;
    this.attributes = paramListInfo.attrs;
  }

  protected IMAPFolder(String paramString, char paramChar, IMAPStore paramIMAPStore)
  {
    super(paramIMAPStore);
    if (paramString == null)
      throw new NullPointerException("Folder name is null");
    this.fullName = paramString;
    this.separator = paramChar;
    this.messageCacheLock = new Object();
    this.debug = paramIMAPStore.getSession().getDebug();
    this.connectionPoolDebug = paramIMAPStore.getConnectionPoolDebug();
    this.out = paramIMAPStore.getSession().getDebugOut();
    if (this.out == null)
      this.out = System.out;
    this.isNamespace = false;
    if ((paramChar != 65535) && (paramChar != 0))
    {
      int i = this.fullName.indexOf(paramChar);
      if ((i > 0) && (i == -1 + this.fullName.length()))
      {
        this.fullName = this.fullName.substring(0, i);
        this.isNamespace = true;
      }
    }
  }

  protected IMAPFolder(String paramString, char paramChar, IMAPStore paramIMAPStore, boolean paramBoolean)
  {
    this(paramString, paramChar, paramIMAPStore);
    this.isNamespace = paramBoolean;
  }

  private void checkClosed()
  {
    if (this.opened)
      throw new IllegalStateException("This operation is not allowed on an open folder");
  }

  private void checkExists()
    throws MessagingException
  {
    if ((!this.exists) && (!exists()))
      throw new FolderNotFoundException(this, this.fullName + " not found");
  }

  private void checkFlags(Flags paramFlags)
    throws MessagingException
  {
    assert (Thread.holdsLock(this));
    if (this.mode != 2)
      throw new IllegalStateException("Cannot change flags on READ_ONLY folder: " + this.fullName);
  }

  private void checkOpened()
    throws FolderClosedException
  {
    assert (Thread.holdsLock(this));
    if (!this.opened)
    {
      if (this.reallyClosed)
        throw new IllegalStateException("This operation is not allowed on a closed folder");
      throw new FolderClosedException(this, "Lost folder connection to server");
    }
  }

  private void checkRange(int paramInt)
    throws MessagingException
  {
    if (paramInt < 1)
      throw new IndexOutOfBoundsException();
    if (paramInt <= this.total);
    while (true)
    {
      return;
      try
      {
        synchronized (this.messageCacheLock)
        {
          try
          {
            keepConnectionAlive(false);
            if (paramInt <= this.total)
              continue;
            throw new IndexOutOfBoundsException();
          }
          catch (ConnectionException localConnectionException)
          {
            throw new FolderClosedException(this, localConnectionException.getMessage());
          }
        }
      }
      catch (ProtocolException localProtocolException)
      {
        throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
      }
    }
  }

  private void cleanup(boolean paramBoolean)
  {
    releaseProtocol(paramBoolean);
    this.protocol = null;
    this.messageCache = null;
    this.uidTable = null;
    this.exists = false;
    this.attributes = null;
    this.opened = false;
    this.idleState = 0;
    notifyConnectionListeners(3);
  }

  private void close(boolean paramBoolean1, boolean paramBoolean2)
    throws MessagingException
  {
    assert (Thread.holdsLock(this));
    synchronized (this.messageCacheLock)
    {
      if ((!this.opened) && (this.reallyClosed))
        throw new IllegalStateException("This operation is not allowed on a closed folder");
    }
    this.reallyClosed = true;
    if (!this.opened)
      return;
    while (true)
    {
      try
      {
        waitIfIdle();
        if (paramBoolean2)
        {
          if (this.debug)
            this.out.println("DEBUG: forcing folder " + this.fullName + " to close");
          if (this.protocol != null)
            this.protocol.disconnect();
          if (this.opened)
            cleanup(true);
          return;
        }
        if (((IMAPStore)this.store).isConnectionPoolFull())
        {
          if (this.debug)
            this.out.println("DEBUG: pool is full, not adding an Authenticated connection");
          if (paramBoolean1)
            this.protocol.close();
          if (this.protocol == null)
            continue;
          this.protocol.logout();
          continue;
        }
      }
      catch (ProtocolException localProtocolException1)
      {
        throw new MessagingException(localProtocolException1.getMessage(), localProtocolException1);
      }
      finally
      {
        if (this.opened)
          cleanup(true);
      }
      if (!paramBoolean1)
      {
        int i = this.mode;
        if (i != 2);
      }
      try
      {
        this.protocol.examine(this.fullName);
        if (this.protocol == null)
          continue;
        this.protocol.close();
      }
      catch (ProtocolException localProtocolException2)
      {
        while (true)
          if (this.protocol != null)
            this.protocol.disconnect();
      }
    }
  }

  private Folder[] doList(final String paramString, final boolean paramBoolean)
    throws MessagingException
  {
    try
    {
      checkExists();
      Object localObject2;
      if (!isDirectory())
        localObject2 = new Folder[0];
      while (true)
      {
        return localObject2;
        final char c = getSeparator();
        ListInfo[] arrayOfListInfo = (ListInfo[])doCommandIgnoreFailure(new ProtocolCommand()
        {
          public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
            throws ProtocolException
          {
            if (paramBoolean)
              return paramAnonymousIMAPProtocol.lsub("", IMAPFolder.this.fullName + c + paramString);
            return paramAnonymousIMAPProtocol.list("", IMAPFolder.this.fullName + c + paramString);
          }
        });
        if (arrayOfListInfo == null)
        {
          localObject2 = new Folder[0];
        }
        else
        {
          int i = arrayOfListInfo.length;
          int j = 0;
          if (i > 0)
          {
            boolean bool = arrayOfListInfo[0].name.equals(this.fullName + c);
            j = 0;
            if (bool)
              j = 1;
          }
          localObject2 = new IMAPFolder[arrayOfListInfo.length - j];
          for (int k = j; k < arrayOfListInfo.length; k++)
            localObject2[(k - j)] = new IMAPFolder(arrayOfListInfo[k], (IMAPStore)this.store);
        }
      }
    }
    finally
    {
    }
  }

  private int findName(ListInfo[] paramArrayOfListInfo, String paramString)
  {
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfListInfo.length);
      while (paramArrayOfListInfo[i].name.equals(paramString))
      {
        if (i >= paramArrayOfListInfo.length)
          i = 0;
        return i;
      }
    }
  }

  private IMAPProtocol getProtocol()
    throws ProtocolException
  {
    assert (Thread.holdsLock(this.messageCacheLock));
    waitIfIdle();
    return this.protocol;
  }

  private Status getStatus()
    throws ProtocolException
  {
    int i = ((IMAPStore)this.store).getStatusCacheTimeout();
    if ((i > 0) && (this.cachedStatus != null) && (System.currentTimeMillis() - this.cachedStatusTime < i))
      return this.cachedStatus;
    IMAPProtocol localIMAPProtocol = null;
    try
    {
      localIMAPProtocol = getStoreProtocol();
      Status localStatus = localIMAPProtocol.status(this.fullName, null);
      if (i > 0)
      {
        this.cachedStatus = localStatus;
        this.cachedStatusTime = System.currentTimeMillis();
      }
      return localStatus;
    }
    finally
    {
      releaseStoreProtocol(localIMAPProtocol);
    }
  }

  private boolean isDirectory()
  {
    return (0x2 & this.type) != 0;
  }

  private void keepConnectionAlive(boolean paramBoolean)
    throws ProtocolException
  {
    if (System.currentTimeMillis() - this.protocol.getTimestamp() > 1000L)
    {
      waitIfIdle();
      this.protocol.noop();
    }
    IMAPProtocol localIMAPProtocol;
    if ((paramBoolean) && (((IMAPStore)this.store).hasSeparateStoreConnection()))
      localIMAPProtocol = null;
    try
    {
      localIMAPProtocol = ((IMAPStore)this.store).getStoreProtocol();
      if (System.currentTimeMillis() - localIMAPProtocol.getTimestamp() > 1000L)
        localIMAPProtocol.noop();
      return;
    }
    finally
    {
      ((IMAPStore)this.store).releaseStoreProtocol(localIMAPProtocol);
    }
  }

  private void releaseProtocol(boolean paramBoolean)
  {
    if (this.protocol != null)
    {
      this.protocol.removeResponseHandler(this);
      if (paramBoolean)
        ((IMAPStore)this.store).releaseProtocol(this, this.protocol);
    }
    else
    {
      return;
    }
    ((IMAPStore)this.store).releaseProtocol(this, null);
  }

  private void setACL(final ACL paramACL, final char paramChar)
    throws MessagingException
  {
    doOptionalCommand("ACL not supported", new ProtocolCommand()
    {
      public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
        throws ProtocolException
      {
        paramAnonymousIMAPProtocol.setACL(IMAPFolder.this.fullName, paramChar, paramACL);
        return null;
      }
    });
  }

  private void throwClosedException(ConnectionException paramConnectionException)
    throws FolderClosedException, StoreClosedException
  {
    try
    {
      if (((this.protocol != null) && (paramConnectionException.getProtocol() == this.protocol)) || ((this.protocol == null) && (!this.reallyClosed)))
        throw new FolderClosedException(this, paramConnectionException.getMessage());
    }
    finally
    {
    }
    throw new StoreClosedException(this.store, paramConnectionException.getMessage());
  }

  public void addACL(ACL paramACL)
    throws MessagingException
  {
    setACL(paramACL, '\000');
  }

  // ERROR //
  public Message[] addMessages(Message[] paramArrayOfMessage)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: aload_1
    //   7: arraylength
    //   8: anewarray 424	javax/mail/internet/MimeMessage
    //   11: astore_3
    //   12: aload_0
    //   13: aload_1
    //   14: invokevirtual 428	com/sun/mail/imap/IMAPFolder:appendUIDMessages	([Ljavax/mail/Message;)[Lcom/sun/mail/imap/AppendUID;
    //   17: astore 4
    //   19: iconst_0
    //   20: istore 5
    //   22: aload 4
    //   24: arraylength
    //   25: istore 6
    //   27: iload 5
    //   29: iload 6
    //   31: if_icmplt +7 -> 38
    //   34: aload_0
    //   35: monitorexit
    //   36: aload_3
    //   37: areturn
    //   38: aload 4
    //   40: iload 5
    //   42: aaload
    //   43: astore 7
    //   45: aload 7
    //   47: ifnull +37 -> 84
    //   50: aload 7
    //   52: getfield 431	com/sun/mail/imap/AppendUID:uidvalidity	J
    //   55: lstore 8
    //   57: aload_0
    //   58: getfield 114	com/sun/mail/imap/IMAPFolder:uidvalidity	J
    //   61: lstore 10
    //   63: lload 8
    //   65: lload 10
    //   67: lcmp
    //   68: ifne +16 -> 84
    //   71: aload_3
    //   72: iload 5
    //   74: aload_0
    //   75: aload 7
    //   77: getfield 434	com/sun/mail/imap/AppendUID:uid	J
    //   80: invokevirtual 438	com/sun/mail/imap/IMAPFolder:getMessageByUID	(J)Ljavax/mail/Message;
    //   83: aastore
    //   84: iinc 5 1
    //   87: goto -65 -> 22
    //   90: astore_2
    //   91: aload_0
    //   92: monitorexit
    //   93: aload_2
    //   94: athrow
    //   95: astore 12
    //   97: goto -13 -> 84
    //
    // Exception table:
    //   from	to	target	type
    //   2	19	90	finally
    //   22	27	90	finally
    //   38	45	90	finally
    //   50	63	90	finally
    //   71	84	90	finally
    //   71	84	95	javax/mail/MessagingException
  }

  public void addRights(ACL paramACL)
    throws MessagingException
  {
    setACL(paramACL, '+');
  }

  // ERROR //
  public void appendMessages(Message[] paramArrayOfMessage)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 323	com/sun/mail/imap/IMAPFolder:checkExists	()V
    //   6: aload_0
    //   7: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   10: checkcast 142	com/sun/mail/imap/IMAPStore
    //   13: invokevirtual 448	com/sun/mail/imap/IMAPStore:getAppendBufferSize	()I
    //   16: istore_3
    //   17: iconst_0
    //   18: istore 4
    //   20: aload_1
    //   21: arraylength
    //   22: istore 5
    //   24: iload 4
    //   26: iload 5
    //   28: if_icmplt +6 -> 34
    //   31: aload_0
    //   32: monitorexit
    //   33: return
    //   34: aload_1
    //   35: iload 4
    //   37: aaload
    //   38: astore 6
    //   40: aload 6
    //   42: invokevirtual 453	javax/mail/Message:getSize	()I
    //   45: iload_3
    //   46: if_icmple +95 -> 141
    //   49: iconst_0
    //   50: istore 9
    //   52: new 455	com/sun/mail/imap/MessageLiteral
    //   55: dup
    //   56: aload 6
    //   58: iload 9
    //   60: invokespecial 458	com/sun/mail/imap/MessageLiteral:<init>	(Ljavax/mail/Message;I)V
    //   63: astore 10
    //   65: aload 6
    //   67: invokevirtual 462	javax/mail/Message:getReceivedDate	()Ljava/util/Date;
    //   70: astore 11
    //   72: aload 11
    //   74: ifnonnull +10 -> 84
    //   77: aload 6
    //   79: invokevirtual 465	javax/mail/Message:getSentDate	()Ljava/util/Date;
    //   82: astore 11
    //   84: aload 11
    //   86: astore 12
    //   88: aload_0
    //   89: new 467	com/sun/mail/imap/IMAPFolder$10
    //   92: dup
    //   93: aload_0
    //   94: aload 6
    //   96: invokevirtual 471	javax/mail/Message:getFlags	()Ljavax/mail/Flags;
    //   99: aload 12
    //   101: aload 10
    //   103: invokespecial 474	com/sun/mail/imap/IMAPFolder$10:<init>	(Lcom/sun/mail/imap/IMAPFolder;Ljavax/mail/Flags;Ljava/util/Date;Lcom/sun/mail/imap/MessageLiteral;)V
    //   106: invokevirtual 477	com/sun/mail/imap/IMAPFolder:doCommand	(Lcom/sun/mail/imap/IMAPFolder$ProtocolCommand;)Ljava/lang/Object;
    //   109: pop
    //   110: goto +25 -> 135
    //   113: astore 8
    //   115: new 201	javax/mail/MessagingException
    //   118: dup
    //   119: ldc_w 479
    //   122: aload 8
    //   124: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   127: athrow
    //   128: astore_2
    //   129: aload_0
    //   130: monitorexit
    //   131: aload_2
    //   132: athrow
    //   133: astore 7
    //   135: iinc 4 1
    //   138: goto -118 -> 20
    //   141: iload_3
    //   142: istore 9
    //   144: goto -92 -> 52
    //
    // Exception table:
    //   from	to	target	type
    //   40	49	113	java/io/IOException
    //   52	65	113	java/io/IOException
    //   2	17	128	finally
    //   20	24	128	finally
    //   34	40	128	finally
    //   40	49	128	finally
    //   52	65	128	finally
    //   65	72	128	finally
    //   77	84	128	finally
    //   88	110	128	finally
    //   115	128	128	finally
    //   40	49	133	javax/mail/MessageRemovedException
    //   52	65	133	javax/mail/MessageRemovedException
  }

  // ERROR //
  public AppendUID[] appendUIDMessages(Message[] paramArrayOfMessage)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 323	com/sun/mail/imap/IMAPFolder:checkExists	()V
    //   6: aload_0
    //   7: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   10: checkcast 142	com/sun/mail/imap/IMAPStore
    //   13: invokevirtual 448	com/sun/mail/imap/IMAPStore:getAppendBufferSize	()I
    //   16: istore_3
    //   17: aload_1
    //   18: arraylength
    //   19: anewarray 430	com/sun/mail/imap/AppendUID
    //   22: astore 4
    //   24: iconst_0
    //   25: istore 5
    //   27: aload_1
    //   28: arraylength
    //   29: istore 6
    //   31: iload 5
    //   33: iload 6
    //   35: if_icmplt +8 -> 43
    //   38: aload_0
    //   39: monitorexit
    //   40: aload 4
    //   42: areturn
    //   43: aload_1
    //   44: iload 5
    //   46: aaload
    //   47: astore 7
    //   49: aload 7
    //   51: invokevirtual 453	javax/mail/Message:getSize	()I
    //   54: iload_3
    //   55: if_icmple +102 -> 157
    //   58: iconst_0
    //   59: istore 10
    //   61: new 455	com/sun/mail/imap/MessageLiteral
    //   64: dup
    //   65: aload 7
    //   67: iload 10
    //   69: invokespecial 458	com/sun/mail/imap/MessageLiteral:<init>	(Ljavax/mail/Message;I)V
    //   72: astore 11
    //   74: aload 7
    //   76: invokevirtual 462	javax/mail/Message:getReceivedDate	()Ljava/util/Date;
    //   79: astore 12
    //   81: aload 12
    //   83: ifnonnull +10 -> 93
    //   86: aload 7
    //   88: invokevirtual 465	javax/mail/Message:getSentDate	()Ljava/util/Date;
    //   91: astore 12
    //   93: aload 12
    //   95: astore 13
    //   97: aload 4
    //   99: iload 5
    //   101: aload_0
    //   102: new 481	com/sun/mail/imap/IMAPFolder$11
    //   105: dup
    //   106: aload_0
    //   107: aload 7
    //   109: invokevirtual 471	javax/mail/Message:getFlags	()Ljavax/mail/Flags;
    //   112: aload 13
    //   114: aload 11
    //   116: invokespecial 482	com/sun/mail/imap/IMAPFolder$11:<init>	(Lcom/sun/mail/imap/IMAPFolder;Ljavax/mail/Flags;Ljava/util/Date;Lcom/sun/mail/imap/MessageLiteral;)V
    //   119: invokevirtual 477	com/sun/mail/imap/IMAPFolder:doCommand	(Lcom/sun/mail/imap/IMAPFolder$ProtocolCommand;)Ljava/lang/Object;
    //   122: checkcast 430	com/sun/mail/imap/AppendUID
    //   125: aastore
    //   126: goto +25 -> 151
    //   129: astore 9
    //   131: new 201	javax/mail/MessagingException
    //   134: dup
    //   135: ldc_w 479
    //   138: aload 9
    //   140: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   143: athrow
    //   144: astore_2
    //   145: aload_0
    //   146: monitorexit
    //   147: aload_2
    //   148: athrow
    //   149: astore 8
    //   151: iinc 5 1
    //   154: goto -127 -> 27
    //   157: iload_3
    //   158: istore 10
    //   160: goto -99 -> 61
    //
    // Exception table:
    //   from	to	target	type
    //   49	58	129	java/io/IOException
    //   61	74	129	java/io/IOException
    //   2	24	144	finally
    //   27	31	144	finally
    //   43	49	144	finally
    //   49	58	144	finally
    //   61	74	144	finally
    //   74	81	144	finally
    //   86	93	144	finally
    //   97	126	144	finally
    //   131	144	144	finally
    //   49	58	149	javax/mail/MessageRemovedException
    //   61	74	149	javax/mail/MessageRemovedException
  }

  public void close(boolean paramBoolean)
    throws MessagingException
  {
    try
    {
      close(paramBoolean, false);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  // ERROR //
  public void copyMessages(Message[] paramArrayOfMessage, Folder paramFolder)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: aload_1
    //   7: arraylength
    //   8: istore 4
    //   10: iload 4
    //   12: ifne +6 -> 18
    //   15: aload_0
    //   16: monitorexit
    //   17: return
    //   18: aload_2
    //   19: invokevirtual 492	javax/mail/Folder:getStore	()Ljavax/mail/Store;
    //   22: aload_0
    //   23: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   26: if_acmpne +168 -> 194
    //   29: aload_0
    //   30: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   33: astore 5
    //   35: aload 5
    //   37: monitorenter
    //   38: aload_0
    //   39: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   42: astore 10
    //   44: aload_1
    //   45: aconst_null
    //   46: invokestatic 500	com/sun/mail/imap/Utility:toMessageSet	([Ljavax/mail/Message;Lcom/sun/mail/imap/Utility$Condition;)[Lcom/sun/mail/imap/protocol/MessageSet;
    //   49: astore 11
    //   51: aload 11
    //   53: ifnonnull +76 -> 129
    //   56: new 445	javax/mail/MessageRemovedException
    //   59: dup
    //   60: ldc_w 502
    //   63: invokespecial 503	javax/mail/MessageRemovedException:<init>	(Ljava/lang/String;)V
    //   66: athrow
    //   67: astore 9
    //   69: aload 9
    //   71: invokevirtual 504	com/sun/mail/iap/CommandFailedException:getMessage	()Ljava/lang/String;
    //   74: ldc_w 506
    //   77: invokevirtual 509	java/lang/String:indexOf	(Ljava/lang/String;)I
    //   80: iconst_m1
    //   81: if_icmpeq +65 -> 146
    //   84: new 205	javax/mail/FolderNotFoundException
    //   87: dup
    //   88: aload_2
    //   89: new 207	java/lang/StringBuilder
    //   92: dup
    //   93: aload_2
    //   94: invokevirtual 512	javax/mail/Folder:getFullName	()Ljava/lang/String;
    //   97: invokestatic 211	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   100: invokespecial 212	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   103: ldc_w 514
    //   106: invokevirtual 218	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   109: invokevirtual 222	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   112: invokespecial 225	javax/mail/FolderNotFoundException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   115: athrow
    //   116: astore 7
    //   118: aload 5
    //   120: monitorexit
    //   121: aload 7
    //   123: athrow
    //   124: astore_3
    //   125: aload_0
    //   126: monitorexit
    //   127: aload_3
    //   128: athrow
    //   129: aload 10
    //   131: aload 11
    //   133: aload_2
    //   134: invokevirtual 512	javax/mail/Folder:getFullName	()Ljava/lang/String;
    //   137: invokevirtual 518	com/sun/mail/imap/protocol/IMAPProtocol:copy	([Lcom/sun/mail/imap/protocol/MessageSet;Ljava/lang/String;)V
    //   140: aload 5
    //   142: monitorexit
    //   143: goto -128 -> 15
    //   146: new 201	javax/mail/MessagingException
    //   149: dup
    //   150: aload 9
    //   152: invokevirtual 504	com/sun/mail/iap/CommandFailedException:getMessage	()Ljava/lang/String;
    //   155: aload 9
    //   157: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   160: athrow
    //   161: astore 8
    //   163: new 244	javax/mail/FolderClosedException
    //   166: dup
    //   167: aload_0
    //   168: aload 8
    //   170: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   173: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   176: athrow
    //   177: astore 6
    //   179: new 201	javax/mail/MessagingException
    //   182: dup
    //   183: aload 6
    //   185: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   188: aload 6
    //   190: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   193: athrow
    //   194: aload_0
    //   195: aload_1
    //   196: aload_2
    //   197: invokespecial 520	javax/mail/Folder:copyMessages	([Ljavax/mail/Message;Ljavax/mail/Folder;)V
    //   200: goto -185 -> 15
    //
    // Exception table:
    //   from	to	target	type
    //   38	51	67	com/sun/mail/iap/CommandFailedException
    //   56	67	67	com/sun/mail/iap/CommandFailedException
    //   129	140	67	com/sun/mail/iap/CommandFailedException
    //   38	51	116	finally
    //   56	67	116	finally
    //   69	116	116	finally
    //   118	121	116	finally
    //   129	140	116	finally
    //   140	143	116	finally
    //   146	161	116	finally
    //   163	177	116	finally
    //   179	194	116	finally
    //   2	10	124	finally
    //   18	38	124	finally
    //   121	124	124	finally
    //   194	200	124	finally
    //   38	51	161	com/sun/mail/iap/ConnectionException
    //   56	67	161	com/sun/mail/iap/ConnectionException
    //   129	140	161	com/sun/mail/iap/ConnectionException
    //   38	51	177	com/sun/mail/iap/ProtocolException
    //   56	67	177	com/sun/mail/iap/ProtocolException
    //   129	140	177	com/sun/mail/iap/ProtocolException
  }

  public boolean create(final int paramInt)
    throws MessagingException
  {
    int i = paramInt & 0x1;
    final char c = '\000';
    if (i == 0);
    try
    {
      c = getSeparator();
      Object localObject2 = doCommandIgnoreFailure(new ProtocolCommand()
      {
        public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
          throws ProtocolException
        {
          if ((0x1 & paramInt) == 0)
            paramAnonymousIMAPProtocol.create(IMAPFolder.this.fullName + c);
          ListInfo[] arrayOfListInfo;
          do
          {
            do
            {
              return Boolean.TRUE;
              paramAnonymousIMAPProtocol.create(IMAPFolder.this.fullName);
            }
            while ((0x2 & paramInt) == 0);
            arrayOfListInfo = paramAnonymousIMAPProtocol.list("", IMAPFolder.this.fullName);
          }
          while ((arrayOfListInfo == null) || (arrayOfListInfo[0].hasInferiors));
          paramAnonymousIMAPProtocol.delete(IMAPFolder.this.fullName);
          throw new ProtocolException("Unsupported type");
        }
      });
      boolean bool;
      if (localObject2 == null)
        bool = false;
      while (true)
      {
        return bool;
        bool = exists();
        if (bool)
          notifyFolderListeners(1);
      }
    }
    finally
    {
    }
  }

  public boolean delete(boolean paramBoolean)
    throws MessagingException
  {
    try
    {
      checkClosed();
      Folder[] arrayOfFolder;
      int i;
      boolean bool;
      if (paramBoolean)
      {
        arrayOfFolder = list();
        i = 0;
        if (i < arrayOfFolder.length);
      }
      else
      {
        Object localObject2 = doCommandIgnoreFailure(new ProtocolCommand()
        {
          public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
            throws ProtocolException
          {
            paramAnonymousIMAPProtocol.delete(IMAPFolder.this.fullName);
            return Boolean.TRUE;
          }
        });
        bool = false;
        if (localObject2 != null)
          break label67;
      }
      while (true)
      {
        return bool;
        arrayOfFolder[i].delete(paramBoolean);
        i++;
        break;
        label67: this.exists = false;
        this.attributes = null;
        notifyFolderListeners(2);
        bool = true;
      }
    }
    finally
    {
    }
  }

  public Object doCommand(ProtocolCommand paramProtocolCommand)
    throws MessagingException
  {
    try
    {
      Object localObject = doProtocolCommand(paramProtocolCommand);
      return localObject;
    }
    catch (ConnectionException localConnectionException)
    {
      throwClosedException(localConnectionException);
      return null;
    }
    catch (ProtocolException localProtocolException)
    {
      throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
    }
  }

  public Object doCommandIgnoreFailure(ProtocolCommand paramProtocolCommand)
    throws MessagingException
  {
    try
    {
      Object localObject = doProtocolCommand(paramProtocolCommand);
      return localObject;
    }
    catch (CommandFailedException localCommandFailedException)
    {
      return null;
    }
    catch (ConnectionException localConnectionException)
    {
      throwClosedException(localConnectionException);
      return null;
    }
    catch (ProtocolException localProtocolException)
    {
      throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
    }
  }

  public Object doOptionalCommand(String paramString, ProtocolCommand paramProtocolCommand)
    throws MessagingException
  {
    try
    {
      Object localObject = doProtocolCommand(paramProtocolCommand);
      return localObject;
    }
    catch (BadCommandException localBadCommandException)
    {
      throw new MessagingException(paramString, localBadCommandException);
    }
    catch (ConnectionException localConnectionException)
    {
      throwClosedException(localConnectionException);
      return null;
    }
    catch (ProtocolException localProtocolException)
    {
      throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
    }
  }

  protected Object doProtocolCommand(ProtocolCommand paramProtocolCommand)
    throws ProtocolException
  {
    try
    {
      if ((this.opened) && (!((IMAPStore)this.store).hasSeparateStoreConnection()))
        synchronized (this.messageCacheLock)
        {
          Object localObject6 = paramProtocolCommand.doCommand(getProtocol());
          return localObject6;
        }
    }
    finally
    {
    }
    IMAPProtocol localIMAPProtocol = null;
    try
    {
      localIMAPProtocol = getStoreProtocol();
      Object localObject3 = paramProtocolCommand.doCommand(localIMAPProtocol);
      return localObject3;
    }
    finally
    {
      releaseStoreProtocol(localIMAPProtocol);
    }
  }

  public boolean exists()
    throws MessagingException
  {
    try
    {
      ((ListInfo[])null);
      final String str;
      ListInfo[] arrayOfListInfo;
      int i;
      if ((this.isNamespace) && (this.separator != 0))
      {
        str = this.fullName + this.separator;
        arrayOfListInfo = (ListInfo[])doCommand(new ProtocolCommand()
        {
          public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
            throws ProtocolException
          {
            return paramAnonymousIMAPProtocol.list("", str);
          }
        });
        if (arrayOfListInfo == null)
          break label240;
        i = findName(arrayOfListInfo, str);
        this.fullName = arrayOfListInfo[i].name;
        this.separator = arrayOfListInfo[i].separator;
        int j = this.fullName.length();
        if ((this.separator != 0) && (j > 0) && (this.fullName.charAt(j - 1) == this.separator))
          this.fullName = this.fullName.substring(0, j - 1);
        this.type = 0;
        if (arrayOfListInfo[i].hasInferiors)
          this.type = (0x2 | this.type);
        if (arrayOfListInfo[i].canOpen)
          this.type = (0x1 | this.type);
        this.exists = true;
      }
      for (this.attributes = arrayOfListInfo[i].attrs; ; this.attributes = null)
      {
        boolean bool = this.exists;
        return bool;
        str = this.fullName;
        break;
        label240: this.exists = this.opened;
      }
    }
    finally
    {
    }
  }

  public Message[] expunge()
    throws MessagingException
  {
    try
    {
      Message[] arrayOfMessage = expunge(null);
      return arrayOfMessage;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  // ERROR //
  public Message[] expunge(Message[] paramArrayOfMessage)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: new 574	java/util/Vector
    //   9: dup
    //   10: invokespecial 575	java/util/Vector:<init>	()V
    //   13: astore_3
    //   14: aload_1
    //   15: ifnull +27 -> 42
    //   18: new 577	javax/mail/FetchProfile
    //   21: dup
    //   22: invokespecial 578	javax/mail/FetchProfile:<init>	()V
    //   25: astore 4
    //   27: aload 4
    //   29: getstatic 584	javax/mail/UIDFolder$FetchProfileItem:UID	Ljavax/mail/UIDFolder$FetchProfileItem;
    //   32: invokevirtual 588	javax/mail/FetchProfile:add	(Ljavax/mail/FetchProfile$Item;)V
    //   35: aload_0
    //   36: aload_1
    //   37: aload 4
    //   39: invokevirtual 592	com/sun/mail/imap/IMAPFolder:fetch	([Ljavax/mail/Message;Ljavax/mail/FetchProfile;)V
    //   42: aload_0
    //   43: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   46: astore 5
    //   48: aload 5
    //   50: monitorenter
    //   51: aload_0
    //   52: iconst_0
    //   53: putfield 118	com/sun/mail/imap/IMAPFolder:doExpungeNotification	Z
    //   56: aload_0
    //   57: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   60: astore 11
    //   62: aload_1
    //   63: ifnull +79 -> 142
    //   66: aload 11
    //   68: aload_1
    //   69: invokestatic 596	com/sun/mail/imap/Utility:toUIDSet	([Ljavax/mail/Message;)[Lcom/sun/mail/imap/protocol/UIDSet;
    //   72: invokevirtual 600	com/sun/mail/imap/protocol/IMAPProtocol:uidexpunge	([Lcom/sun/mail/imap/protocol/UIDSet;)V
    //   75: aload_0
    //   76: iconst_1
    //   77: putfield 118	com/sun/mail/imap/IMAPFolder:doExpungeNotification	Z
    //   80: iconst_0
    //   81: istore 12
    //   83: iload 12
    //   85: aload_0
    //   86: getfield 275	com/sun/mail/imap/IMAPFolder:messageCache	Ljava/util/Vector;
    //   89: invokevirtual 603	java/util/Vector:size	()I
    //   92: if_icmplt +167 -> 259
    //   95: aload 5
    //   97: monitorexit
    //   98: aload_0
    //   99: aload_0
    //   100: getfield 275	com/sun/mail/imap/IMAPFolder:messageCache	Ljava/util/Vector;
    //   103: invokevirtual 603	java/util/Vector:size	()I
    //   106: putfield 106	com/sun/mail/imap/IMAPFolder:total	I
    //   109: aload_3
    //   110: invokevirtual 603	java/util/Vector:size	()I
    //   113: anewarray 450	javax/mail/Message
    //   116: astore 17
    //   118: aload_3
    //   119: aload 17
    //   121: invokevirtual 607	java/util/Vector:copyInto	([Ljava/lang/Object;)V
    //   124: aload 17
    //   126: arraylength
    //   127: ifle +10 -> 137
    //   130: aload_0
    //   131: iconst_1
    //   132: aload 17
    //   134: invokevirtual 611	com/sun/mail/imap/IMAPFolder:notifyMessageRemovedListeners	(Z[Ljavax/mail/Message;)V
    //   137: aload_0
    //   138: monitorexit
    //   139: aload 17
    //   141: areturn
    //   142: aload 11
    //   144: invokevirtual 613	com/sun/mail/imap/protocol/IMAPProtocol:expunge	()V
    //   147: goto -72 -> 75
    //   150: astore 10
    //   152: aload_0
    //   153: getfield 239	com/sun/mail/imap/IMAPFolder:mode	I
    //   156: iconst_2
    //   157: if_icmpeq +54 -> 211
    //   160: new 195	java/lang/IllegalStateException
    //   163: dup
    //   164: new 207	java/lang/StringBuilder
    //   167: dup
    //   168: ldc_w 615
    //   171: invokespecial 212	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   174: aload_0
    //   175: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   178: invokevirtual 218	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   181: invokevirtual 222	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   184: invokespecial 198	java/lang/IllegalStateException:<init>	(Ljava/lang/String;)V
    //   187: athrow
    //   188: astore 8
    //   190: aload_0
    //   191: iconst_1
    //   192: putfield 118	com/sun/mail/imap/IMAPFolder:doExpungeNotification	Z
    //   195: aload 8
    //   197: athrow
    //   198: astore 6
    //   200: aload 5
    //   202: monitorexit
    //   203: aload 6
    //   205: athrow
    //   206: astore_2
    //   207: aload_0
    //   208: monitorexit
    //   209: aload_2
    //   210: athrow
    //   211: new 201	javax/mail/MessagingException
    //   214: dup
    //   215: aload 10
    //   217: invokevirtual 504	com/sun/mail/iap/CommandFailedException:getMessage	()Ljava/lang/String;
    //   220: aload 10
    //   222: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   225: athrow
    //   226: astore 9
    //   228: new 244	javax/mail/FolderClosedException
    //   231: dup
    //   232: aload_0
    //   233: aload 9
    //   235: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   238: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   241: athrow
    //   242: astore 7
    //   244: new 201	javax/mail/MessagingException
    //   247: dup
    //   248: aload 7
    //   250: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   253: aload 7
    //   255: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   258: athrow
    //   259: aload_0
    //   260: getfield 275	com/sun/mail/imap/IMAPFolder:messageCache	Ljava/util/Vector;
    //   263: iload 12
    //   265: invokevirtual 619	java/util/Vector:elementAt	(I)Ljava/lang/Object;
    //   268: checkcast 621	com/sun/mail/imap/IMAPMessage
    //   271: astore 13
    //   273: aload 13
    //   275: invokevirtual 624	com/sun/mail/imap/IMAPMessage:isExpunged	()Z
    //   278: ifeq +61 -> 339
    //   281: aload_3
    //   282: aload 13
    //   284: invokevirtual 628	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   287: aload_0
    //   288: getfield 275	com/sun/mail/imap/IMAPFolder:messageCache	Ljava/util/Vector;
    //   291: iload 12
    //   293: invokevirtual 631	java/util/Vector:removeElementAt	(I)V
    //   296: aload_0
    //   297: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   300: ifnull -217 -> 83
    //   303: aload 13
    //   305: invokevirtual 634	com/sun/mail/imap/IMAPMessage:getUID	()J
    //   308: lstore 14
    //   310: lload 14
    //   312: ldc2_w 111
    //   315: lcmp
    //   316: ifeq -233 -> 83
    //   319: aload_0
    //   320: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   323: new 636	java/lang/Long
    //   326: dup
    //   327: lload 14
    //   329: invokespecial 639	java/lang/Long:<init>	(J)V
    //   332: invokevirtual 645	java/util/Hashtable:remove	(Ljava/lang/Object;)Ljava/lang/Object;
    //   335: pop
    //   336: goto -253 -> 83
    //   339: aload 13
    //   341: aload 13
    //   343: invokevirtual 648	com/sun/mail/imap/IMAPMessage:getSequenceNumber	()I
    //   346: invokevirtual 651	com/sun/mail/imap/IMAPMessage:setMessageNumber	(I)V
    //   349: iinc 12 1
    //   352: goto -269 -> 83
    //
    // Exception table:
    //   from	to	target	type
    //   56	62	150	com/sun/mail/iap/CommandFailedException
    //   66	75	150	com/sun/mail/iap/CommandFailedException
    //   142	147	150	com/sun/mail/iap/CommandFailedException
    //   56	62	188	finally
    //   66	75	188	finally
    //   142	147	188	finally
    //   152	188	188	finally
    //   211	226	188	finally
    //   228	242	188	finally
    //   244	259	188	finally
    //   51	56	198	finally
    //   75	80	198	finally
    //   83	98	198	finally
    //   190	198	198	finally
    //   200	203	198	finally
    //   259	310	198	finally
    //   319	336	198	finally
    //   339	349	198	finally
    //   2	14	206	finally
    //   18	42	206	finally
    //   42	51	206	finally
    //   98	137	206	finally
    //   203	206	206	finally
    //   56	62	226	com/sun/mail/iap/ConnectionException
    //   66	75	226	com/sun/mail/iap/ConnectionException
    //   142	147	226	com/sun/mail/iap/ConnectionException
    //   56	62	242	com/sun/mail/iap/ProtocolException
    //   66	75	242	com/sun/mail/iap/ProtocolException
    //   142	147	242	com/sun/mail/iap/ProtocolException
  }

  public void fetch(Message[] paramArrayOfMessage, FetchProfile paramFetchProfile)
    throws MessagingException
  {
    try
    {
      checkOpened();
      IMAPMessage.fetch(this, paramArrayOfMessage, paramFetchProfile);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void forceClose()
    throws MessagingException
  {
    try
    {
      close(false, true);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public ACL[] getACL()
    throws MessagingException
  {
    return (ACL[])doOptionalCommand("ACL not supported", new ProtocolCommand()
    {
      public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
        throws ProtocolException
      {
        return paramAnonymousIMAPProtocol.getACL(IMAPFolder.this.fullName);
      }
    });
  }

  public String[] getAttributes()
    throws MessagingException
  {
    if (this.attributes == null)
      exists();
    return (String[])this.attributes.clone();
  }

  // ERROR //
  public int getDeletedMessageCount()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   6: ifne +15 -> 21
    //   9: aload_0
    //   10: invokespecial 323	com/sun/mail/imap/IMAPFolder:checkExists	()V
    //   13: iconst_m1
    //   14: istore 7
    //   16: aload_0
    //   17: monitorexit
    //   18: iload 7
    //   20: ireturn
    //   21: new 672	javax/mail/Flags
    //   24: dup
    //   25: invokespecial 673	javax/mail/Flags:<init>	()V
    //   28: astore_2
    //   29: aload_2
    //   30: getstatic 679	javax/mail/Flags$Flag:DELETED	Ljavax/mail/Flags$Flag;
    //   33: invokevirtual 682	javax/mail/Flags:add	(Ljavax/mail/Flags$Flag;)V
    //   36: aload_0
    //   37: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   40: astore 5
    //   42: aload 5
    //   44: monitorenter
    //   45: aload_0
    //   46: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   49: new 684	javax/mail/search/FlagTerm
    //   52: dup
    //   53: aload_2
    //   54: iconst_1
    //   55: invokespecial 687	javax/mail/search/FlagTerm:<init>	(Ljavax/mail/Flags;Z)V
    //   58: invokevirtual 691	com/sun/mail/imap/protocol/IMAPProtocol:search	(Ljavax/mail/search/SearchTerm;)[I
    //   61: arraylength
    //   62: istore 7
    //   64: aload 5
    //   66: monitorexit
    //   67: goto -51 -> 16
    //   70: astore 6
    //   72: aload 5
    //   74: monitorexit
    //   75: aload 6
    //   77: athrow
    //   78: astore 4
    //   80: new 244	javax/mail/FolderClosedException
    //   83: dup
    //   84: aload_0
    //   85: aload 4
    //   87: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   90: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   93: athrow
    //   94: astore_1
    //   95: aload_0
    //   96: monitorexit
    //   97: aload_1
    //   98: athrow
    //   99: astore_3
    //   100: new 201	javax/mail/MessagingException
    //   103: dup
    //   104: aload_3
    //   105: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   108: aload_3
    //   109: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   112: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   45	67	70	finally
    //   72	75	70	finally
    //   36	45	78	com/sun/mail/iap/ConnectionException
    //   75	78	78	com/sun/mail/iap/ConnectionException
    //   2	13	94	finally
    //   21	36	94	finally
    //   36	45	94	finally
    //   75	78	94	finally
    //   80	94	94	finally
    //   100	113	94	finally
    //   36	45	99	com/sun/mail/iap/ProtocolException
    //   75	78	99	com/sun/mail/iap/ProtocolException
  }

  public Folder getFolder(String paramString)
    throws MessagingException
  {
    if ((this.attributes != null) && (!isDirectory()))
      throw new MessagingException("Cannot contain subfolders");
    char c = getSeparator();
    return new IMAPFolder(this.fullName + c + paramString, c, (IMAPStore)this.store);
  }

  public String getFullName()
  {
    try
    {
      String str = this.fullName;
      return str;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public Message getMessage(int paramInt)
    throws MessagingException
  {
    try
    {
      checkOpened();
      checkRange(paramInt);
      Message localMessage = (Message)this.messageCache.elementAt(paramInt - 1);
      return localMessage;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  IMAPMessage getMessageBySeqNumber(int paramInt)
  {
    for (int i = paramInt - 1; ; i++)
    {
      IMAPMessage localIMAPMessage;
      if (i >= this.total)
        localIMAPMessage = null;
      do
      {
        return localIMAPMessage;
        localIMAPMessage = (IMAPMessage)this.messageCache.elementAt(i);
      }
      while (localIMAPMessage.getSequenceNumber() == paramInt);
    }
  }

  // ERROR //
  public Message getMessageByUID(long paramLong)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: aconst_null
    //   7: astore 4
    //   9: aload_0
    //   10: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   13: astore 7
    //   15: aload 7
    //   17: monitorenter
    //   18: new 636	java/lang/Long
    //   21: dup
    //   22: lload_1
    //   23: invokespecial 639	java/lang/Long:<init>	(J)V
    //   26: astore 8
    //   28: aload_0
    //   29: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   32: ifnull +34 -> 66
    //   35: aload_0
    //   36: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   39: aload 8
    //   41: invokevirtual 704	java/util/Hashtable:get	(Ljava/lang/Object;)Ljava/lang/Object;
    //   44: checkcast 621	com/sun/mail/imap/IMAPMessage
    //   47: astore 4
    //   49: aload 4
    //   51: ifnull +26 -> 77
    //   54: aload 7
    //   56: monitorexit
    //   57: aload 4
    //   59: astore 11
    //   61: aload_0
    //   62: monitorexit
    //   63: aload 11
    //   65: areturn
    //   66: aload_0
    //   67: new 641	java/util/Hashtable
    //   70: dup
    //   71: invokespecial 705	java/util/Hashtable:<init>	()V
    //   74: putfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   77: aload_0
    //   78: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   81: lload_1
    //   82: invokevirtual 709	com/sun/mail/imap/protocol/IMAPProtocol:fetchSequenceNumber	(J)Lcom/sun/mail/imap/protocol/UID;
    //   85: astore 10
    //   87: aload 10
    //   89: ifnull +48 -> 137
    //   92: aload 10
    //   94: getfield 714	com/sun/mail/imap/protocol/UID:seqnum	I
    //   97: aload_0
    //   98: getfield 106	com/sun/mail/imap/IMAPFolder:total	I
    //   101: if_icmpgt +36 -> 137
    //   104: aload_0
    //   105: aload 10
    //   107: getfield 714	com/sun/mail/imap/protocol/UID:seqnum	I
    //   110: invokevirtual 716	com/sun/mail/imap/IMAPFolder:getMessageBySeqNumber	(I)Lcom/sun/mail/imap/IMAPMessage;
    //   113: astore 4
    //   115: aload 4
    //   117: aload 10
    //   119: getfield 717	com/sun/mail/imap/protocol/UID:uid	J
    //   122: invokevirtual 720	com/sun/mail/imap/IMAPMessage:setUID	(J)V
    //   125: aload_0
    //   126: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   129: aload 8
    //   131: aload 4
    //   133: invokevirtual 724	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   136: pop
    //   137: aload 7
    //   139: monitorexit
    //   140: aload 4
    //   142: astore 11
    //   144: goto -83 -> 61
    //   147: astore 9
    //   149: aload 7
    //   151: monitorexit
    //   152: aload 9
    //   154: athrow
    //   155: astore 6
    //   157: new 244	javax/mail/FolderClosedException
    //   160: dup
    //   161: aload_0
    //   162: aload 6
    //   164: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   167: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   170: athrow
    //   171: astore_3
    //   172: aload_0
    //   173: monitorexit
    //   174: aload_3
    //   175: athrow
    //   176: astore 5
    //   178: new 201	javax/mail/MessagingException
    //   181: dup
    //   182: aload 5
    //   184: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   187: aload 5
    //   189: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   192: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   18	49	147	finally
    //   54	57	147	finally
    //   66	77	147	finally
    //   77	87	147	finally
    //   92	137	147	finally
    //   137	140	147	finally
    //   149	152	147	finally
    //   9	18	155	com/sun/mail/iap/ConnectionException
    //   152	155	155	com/sun/mail/iap/ConnectionException
    //   2	6	171	finally
    //   9	18	171	finally
    //   152	155	171	finally
    //   157	171	171	finally
    //   178	193	171	finally
    //   9	18	176	com/sun/mail/iap/ProtocolException
    //   152	155	176	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public int getMessageCount()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   6: ifne +133 -> 139
    //   9: aload_0
    //   10: invokespecial 323	com/sun/mail/imap/IMAPFolder:checkExists	()V
    //   13: aload_0
    //   14: invokespecial 188	com/sun/mail/imap/IMAPFolder:getStatus	()Lcom/sun/mail/imap/protocol/Status;
    //   17: getfield 728	com/sun/mail/imap/protocol/Status:total	I
    //   20: istore 6
    //   22: aload_0
    //   23: monitorexit
    //   24: iload 6
    //   26: ireturn
    //   27: astore 9
    //   29: aconst_null
    //   30: astore 10
    //   32: aload_0
    //   33: invokevirtual 363	com/sun/mail/imap/IMAPFolder:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   36: astore 10
    //   38: aload 10
    //   40: aload_0
    //   41: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   44: invokevirtual 319	com/sun/mail/imap/protocol/IMAPProtocol:examine	(Ljava/lang/String;)Lcom/sun/mail/imap/protocol/MailboxInfo;
    //   47: astore 13
    //   49: aload 10
    //   51: invokevirtual 312	com/sun/mail/imap/protocol/IMAPProtocol:close	()V
    //   54: aload 13
    //   56: getfield 731	com/sun/mail/imap/protocol/MailboxInfo:total	I
    //   59: istore 6
    //   61: aload_0
    //   62: aload 10
    //   64: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   67: goto -45 -> 22
    //   70: astore_1
    //   71: aload_0
    //   72: monitorexit
    //   73: aload_1
    //   74: athrow
    //   75: astore 12
    //   77: new 201	javax/mail/MessagingException
    //   80: dup
    //   81: aload 12
    //   83: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   86: aload 12
    //   88: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   91: athrow
    //   92: astore 11
    //   94: aload_0
    //   95: aload 10
    //   97: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   100: aload 11
    //   102: athrow
    //   103: astore 8
    //   105: new 408	javax/mail/StoreClosedException
    //   108: dup
    //   109: aload_0
    //   110: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   113: aload 8
    //   115: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   118: invokespecial 414	javax/mail/StoreClosedException:<init>	(Ljavax/mail/Store;Ljava/lang/String;)V
    //   121: athrow
    //   122: astore 7
    //   124: new 201	javax/mail/MessagingException
    //   127: dup
    //   128: aload 7
    //   130: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   133: aload 7
    //   135: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   138: athrow
    //   139: aload_0
    //   140: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   143: astore_2
    //   144: aload_2
    //   145: monitorenter
    //   146: aload_0
    //   147: iconst_1
    //   148: invokespecial 260	com/sun/mail/imap/IMAPFolder:keepConnectionAlive	(Z)V
    //   151: aload_0
    //   152: getfield 106	com/sun/mail/imap/IMAPFolder:total	I
    //   155: istore 6
    //   157: aload_2
    //   158: monitorexit
    //   159: goto -137 -> 22
    //   162: astore 4
    //   164: aload_2
    //   165: monitorexit
    //   166: aload 4
    //   168: athrow
    //   169: astore 5
    //   171: new 244	javax/mail/FolderClosedException
    //   174: dup
    //   175: aload_0
    //   176: aload 5
    //   178: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   181: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   184: athrow
    //   185: astore_3
    //   186: new 201	javax/mail/MessagingException
    //   189: dup
    //   190: aload_3
    //   191: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   194: aload_3
    //   195: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   198: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   13	22	27	com/sun/mail/iap/BadCommandException
    //   2	13	70	finally
    //   13	22	70	finally
    //   61	67	70	finally
    //   94	103	70	finally
    //   105	122	70	finally
    //   124	139	70	finally
    //   139	146	70	finally
    //   166	169	70	finally
    //   32	61	75	com/sun/mail/iap/ProtocolException
    //   32	61	92	finally
    //   77	92	92	finally
    //   13	22	103	com/sun/mail/iap/ConnectionException
    //   13	22	122	com/sun/mail/iap/ProtocolException
    //   146	157	162	finally
    //   157	159	162	finally
    //   164	166	162	finally
    //   171	185	162	finally
    //   186	199	162	finally
    //   146	157	169	com/sun/mail/iap/ConnectionException
    //   146	157	185	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public Message[] getMessagesByUID(long paramLong1, long paramLong2)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: aload_0
    //   7: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   10: astore 8
    //   12: aload 8
    //   14: monitorenter
    //   15: aload_0
    //   16: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   19: ifnonnull +14 -> 33
    //   22: aload_0
    //   23: new 641	java/util/Hashtable
    //   26: dup
    //   27: invokespecial 705	java/util/Hashtable:<init>	()V
    //   30: putfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   33: aload_0
    //   34: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   37: lload_1
    //   38: lload_3
    //   39: invokevirtual 737	com/sun/mail/imap/protocol/IMAPProtocol:fetchSequenceNumbers	(JJ)[Lcom/sun/mail/imap/protocol/UID;
    //   42: astore 10
    //   44: aload 10
    //   46: arraylength
    //   47: anewarray 450	javax/mail/Message
    //   50: astore 11
    //   52: iconst_0
    //   53: istore 12
    //   55: iload 12
    //   57: aload 10
    //   59: arraylength
    //   60: if_icmplt +11 -> 71
    //   63: aload 8
    //   65: monitorexit
    //   66: aload_0
    //   67: monitorexit
    //   68: aload 11
    //   70: areturn
    //   71: aload_0
    //   72: aload 10
    //   74: iload 12
    //   76: aaload
    //   77: getfield 714	com/sun/mail/imap/protocol/UID:seqnum	I
    //   80: invokevirtual 716	com/sun/mail/imap/IMAPFolder:getMessageBySeqNumber	(I)Lcom/sun/mail/imap/IMAPMessage;
    //   83: astore 13
    //   85: aload 13
    //   87: aload 10
    //   89: iload 12
    //   91: aaload
    //   92: getfield 717	com/sun/mail/imap/protocol/UID:uid	J
    //   95: invokevirtual 720	com/sun/mail/imap/IMAPMessage:setUID	(J)V
    //   98: aload 11
    //   100: iload 12
    //   102: aload 13
    //   104: aastore
    //   105: aload_0
    //   106: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   109: new 636	java/lang/Long
    //   112: dup
    //   113: aload 10
    //   115: iload 12
    //   117: aaload
    //   118: getfield 717	com/sun/mail/imap/protocol/UID:uid	J
    //   121: invokespecial 639	java/lang/Long:<init>	(J)V
    //   124: aload 13
    //   126: invokevirtual 724	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   129: pop
    //   130: iinc 12 1
    //   133: goto -78 -> 55
    //   136: astore 9
    //   138: aload 8
    //   140: monitorexit
    //   141: aload 9
    //   143: athrow
    //   144: astore 7
    //   146: new 244	javax/mail/FolderClosedException
    //   149: dup
    //   150: aload_0
    //   151: aload 7
    //   153: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   156: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   159: athrow
    //   160: astore 5
    //   162: aload_0
    //   163: monitorexit
    //   164: aload 5
    //   166: athrow
    //   167: astore 6
    //   169: new 201	javax/mail/MessagingException
    //   172: dup
    //   173: aload 6
    //   175: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   178: aload 6
    //   180: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   183: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   15	33	136	finally
    //   33	52	136	finally
    //   55	66	136	finally
    //   71	130	136	finally
    //   138	141	136	finally
    //   6	15	144	com/sun/mail/iap/ConnectionException
    //   141	144	144	com/sun/mail/iap/ConnectionException
    //   2	6	160	finally
    //   6	15	160	finally
    //   141	144	160	finally
    //   146	160	160	finally
    //   169	184	160	finally
    //   6	15	167	com/sun/mail/iap/ProtocolException
    //   141	144	167	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public Message[] getMessagesByUID(long[] paramArrayOfLong)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: aload_0
    //   7: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   10: astore 5
    //   12: aload 5
    //   14: monitorenter
    //   15: aload_1
    //   16: astore 6
    //   18: aload_0
    //   19: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   22: ifnull +157 -> 179
    //   25: new 574	java/util/Vector
    //   28: dup
    //   29: invokespecial 575	java/util/Vector:<init>	()V
    //   32: astore 8
    //   34: iconst_0
    //   35: istore 9
    //   37: iload 9
    //   39: aload_1
    //   40: arraylength
    //   41: if_icmplt +75 -> 116
    //   44: aload 8
    //   46: invokevirtual 603	java/util/Vector:size	()I
    //   49: istore 12
    //   51: iload 12
    //   53: newarray long
    //   55: astore 6
    //   57: iconst_0
    //   58: istore 13
    //   60: goto +266 -> 326
    //   63: aload 6
    //   65: arraylength
    //   66: ifle +25 -> 91
    //   69: aload_0
    //   70: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   73: aload 6
    //   75: invokevirtual 741	com/sun/mail/imap/protocol/IMAPProtocol:fetchSequenceNumbers	([J)[Lcom/sun/mail/imap/protocol/UID;
    //   78: astore 16
    //   80: iconst_0
    //   81: istore 17
    //   83: iload 17
    //   85: aload 16
    //   87: arraylength
    //   88: if_icmplt +134 -> 222
    //   91: aload_1
    //   92: arraylength
    //   93: anewarray 450	javax/mail/Message
    //   96: astore 14
    //   98: iconst_0
    //   99: istore 15
    //   101: iload 15
    //   103: aload_1
    //   104: arraylength
    //   105: if_icmplt +175 -> 280
    //   108: aload 5
    //   110: monitorexit
    //   111: aload_0
    //   112: monitorexit
    //   113: aload 14
    //   115: areturn
    //   116: aload_0
    //   117: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   120: astore 10
    //   122: new 636	java/lang/Long
    //   125: dup
    //   126: aload_1
    //   127: iload 9
    //   129: laload
    //   130: invokespecial 639	java/lang/Long:<init>	(J)V
    //   133: astore 11
    //   135: aload 10
    //   137: aload 11
    //   139: invokevirtual 744	java/util/Hashtable:containsKey	(Ljava/lang/Object;)Z
    //   142: ifne +194 -> 336
    //   145: aload 8
    //   147: aload 11
    //   149: invokevirtual 628	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   152: goto +184 -> 336
    //   155: aload 6
    //   157: iload 13
    //   159: aload 8
    //   161: iload 13
    //   163: invokevirtual 619	java/util/Vector:elementAt	(I)Ljava/lang/Object;
    //   166: checkcast 636	java/lang/Long
    //   169: invokevirtual 747	java/lang/Long:longValue	()J
    //   172: lastore
    //   173: iinc 13 1
    //   176: goto +150 -> 326
    //   179: aload_0
    //   180: new 641	java/util/Hashtable
    //   183: dup
    //   184: invokespecial 705	java/util/Hashtable:<init>	()V
    //   187: putfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   190: goto -127 -> 63
    //   193: astore 7
    //   195: aload 5
    //   197: monitorexit
    //   198: aload 7
    //   200: athrow
    //   201: astore 4
    //   203: new 244	javax/mail/FolderClosedException
    //   206: dup
    //   207: aload_0
    //   208: aload 4
    //   210: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   213: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   216: athrow
    //   217: astore_2
    //   218: aload_0
    //   219: monitorexit
    //   220: aload_2
    //   221: athrow
    //   222: aload_0
    //   223: aload 16
    //   225: iload 17
    //   227: aaload
    //   228: getfield 714	com/sun/mail/imap/protocol/UID:seqnum	I
    //   231: invokevirtual 716	com/sun/mail/imap/IMAPFolder:getMessageBySeqNumber	(I)Lcom/sun/mail/imap/IMAPMessage;
    //   234: astore 18
    //   236: aload 18
    //   238: aload 16
    //   240: iload 17
    //   242: aaload
    //   243: getfield 717	com/sun/mail/imap/protocol/UID:uid	J
    //   246: invokevirtual 720	com/sun/mail/imap/IMAPMessage:setUID	(J)V
    //   249: aload_0
    //   250: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   253: new 636	java/lang/Long
    //   256: dup
    //   257: aload 16
    //   259: iload 17
    //   261: aaload
    //   262: getfield 717	com/sun/mail/imap/protocol/UID:uid	J
    //   265: invokespecial 639	java/lang/Long:<init>	(J)V
    //   268: aload 18
    //   270: invokevirtual 724	java/util/Hashtable:put	(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;
    //   273: pop
    //   274: iinc 17 1
    //   277: goto -194 -> 83
    //   280: aload 14
    //   282: iload 15
    //   284: aload_0
    //   285: getfield 277	com/sun/mail/imap/IMAPFolder:uidTable	Ljava/util/Hashtable;
    //   288: new 636	java/lang/Long
    //   291: dup
    //   292: aload_1
    //   293: iload 15
    //   295: laload
    //   296: invokespecial 639	java/lang/Long:<init>	(J)V
    //   299: invokevirtual 704	java/util/Hashtable:get	(Ljava/lang/Object;)Ljava/lang/Object;
    //   302: checkcast 450	javax/mail/Message
    //   305: aastore
    //   306: iinc 15 1
    //   309: goto -208 -> 101
    //   312: astore_3
    //   313: new 201	javax/mail/MessagingException
    //   316: dup
    //   317: aload_3
    //   318: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   321: aload_3
    //   322: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   325: athrow
    //   326: iload 13
    //   328: iload 12
    //   330: if_icmplt -175 -> 155
    //   333: goto -270 -> 63
    //   336: iinc 9 1
    //   339: goto -302 -> 37
    //
    // Exception table:
    //   from	to	target	type
    //   18	34	193	finally
    //   37	57	193	finally
    //   63	80	193	finally
    //   83	91	193	finally
    //   91	98	193	finally
    //   101	111	193	finally
    //   116	152	193	finally
    //   155	173	193	finally
    //   179	190	193	finally
    //   195	198	193	finally
    //   222	274	193	finally
    //   280	306	193	finally
    //   6	15	201	com/sun/mail/iap/ConnectionException
    //   198	201	201	com/sun/mail/iap/ConnectionException
    //   2	6	217	finally
    //   6	15	217	finally
    //   198	201	217	finally
    //   203	217	217	finally
    //   313	326	217	finally
    //   6	15	312	com/sun/mail/iap/ProtocolException
    //   198	201	312	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public String getName()
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 749	com/sun/mail/imap/IMAPFolder:name	Ljava/lang/String;
    //   6: astore_2
    //   7: aload_2
    //   8: ifnonnull +27 -> 35
    //   11: aload_0
    //   12: aload_0
    //   13: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   16: iconst_1
    //   17: aload_0
    //   18: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   21: aload_0
    //   22: invokevirtual 330	com/sun/mail/imap/IMAPFolder:getSeparator	()C
    //   25: invokevirtual 752	java/lang/String:lastIndexOf	(I)I
    //   28: iadd
    //   29: invokevirtual 755	java/lang/String:substring	(I)Ljava/lang/String;
    //   32: putfield 749	com/sun/mail/imap/IMAPFolder:name	Ljava/lang/String;
    //   35: aload_0
    //   36: getfield 749	com/sun/mail/imap/IMAPFolder:name	Ljava/lang/String;
    //   39: astore_3
    //   40: aload_0
    //   41: monitorexit
    //   42: aload_3
    //   43: areturn
    //   44: astore_1
    //   45: aload_0
    //   46: monitorexit
    //   47: aload_1
    //   48: athrow
    //   49: astore 4
    //   51: goto -16 -> 35
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	44	finally
    //   11	35	44	finally
    //   35	40	44	finally
    //   11	35	49	javax/mail/MessagingException
  }

  // ERROR //
  public int getNewMessageCount()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   6: ifne +133 -> 139
    //   9: aload_0
    //   10: invokespecial 323	com/sun/mail/imap/IMAPFolder:checkExists	()V
    //   13: aload_0
    //   14: invokespecial 188	com/sun/mail/imap/IMAPFolder:getStatus	()Lcom/sun/mail/imap/protocol/Status;
    //   17: getfield 757	com/sun/mail/imap/protocol/Status:recent	I
    //   20: istore 6
    //   22: aload_0
    //   23: monitorexit
    //   24: iload 6
    //   26: ireturn
    //   27: astore 9
    //   29: aconst_null
    //   30: astore 10
    //   32: aload_0
    //   33: invokevirtual 363	com/sun/mail/imap/IMAPFolder:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   36: astore 10
    //   38: aload 10
    //   40: aload_0
    //   41: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   44: invokevirtual 319	com/sun/mail/imap/protocol/IMAPProtocol:examine	(Ljava/lang/String;)Lcom/sun/mail/imap/protocol/MailboxInfo;
    //   47: astore 13
    //   49: aload 10
    //   51: invokevirtual 312	com/sun/mail/imap/protocol/IMAPProtocol:close	()V
    //   54: aload 13
    //   56: getfield 758	com/sun/mail/imap/protocol/MailboxInfo:recent	I
    //   59: istore 6
    //   61: aload_0
    //   62: aload 10
    //   64: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   67: goto -45 -> 22
    //   70: astore_1
    //   71: aload_0
    //   72: monitorexit
    //   73: aload_1
    //   74: athrow
    //   75: astore 12
    //   77: new 201	javax/mail/MessagingException
    //   80: dup
    //   81: aload 12
    //   83: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   86: aload 12
    //   88: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   91: athrow
    //   92: astore 11
    //   94: aload_0
    //   95: aload 10
    //   97: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   100: aload 11
    //   102: athrow
    //   103: astore 8
    //   105: new 408	javax/mail/StoreClosedException
    //   108: dup
    //   109: aload_0
    //   110: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   113: aload 8
    //   115: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   118: invokespecial 414	javax/mail/StoreClosedException:<init>	(Ljavax/mail/Store;Ljava/lang/String;)V
    //   121: athrow
    //   122: astore 7
    //   124: new 201	javax/mail/MessagingException
    //   127: dup
    //   128: aload 7
    //   130: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   133: aload 7
    //   135: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   138: athrow
    //   139: aload_0
    //   140: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   143: astore_2
    //   144: aload_2
    //   145: monitorenter
    //   146: aload_0
    //   147: iconst_1
    //   148: invokespecial 260	com/sun/mail/imap/IMAPFolder:keepConnectionAlive	(Z)V
    //   151: aload_0
    //   152: getfield 108	com/sun/mail/imap/IMAPFolder:recent	I
    //   155: istore 6
    //   157: aload_2
    //   158: monitorexit
    //   159: goto -137 -> 22
    //   162: astore 4
    //   164: aload_2
    //   165: monitorexit
    //   166: aload 4
    //   168: athrow
    //   169: astore 5
    //   171: new 244	javax/mail/FolderClosedException
    //   174: dup
    //   175: aload_0
    //   176: aload 5
    //   178: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   181: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   184: athrow
    //   185: astore_3
    //   186: new 201	javax/mail/MessagingException
    //   189: dup
    //   190: aload_3
    //   191: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   194: aload_3
    //   195: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   198: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   13	22	27	com/sun/mail/iap/BadCommandException
    //   2	13	70	finally
    //   13	22	70	finally
    //   61	67	70	finally
    //   94	103	70	finally
    //   105	122	70	finally
    //   124	139	70	finally
    //   139	146	70	finally
    //   166	169	70	finally
    //   32	61	75	com/sun/mail/iap/ProtocolException
    //   32	61	92	finally
    //   77	92	92	finally
    //   13	22	103	com/sun/mail/iap/ConnectionException
    //   13	22	122	com/sun/mail/iap/ProtocolException
    //   146	157	162	finally
    //   157	159	162	finally
    //   164	166	162	finally
    //   171	185	162	finally
    //   186	199	162	finally
    //   146	157	169	com/sun/mail/iap/ConnectionException
    //   146	157	185	com/sun/mail/iap/ProtocolException
  }

  public Folder getParent()
    throws MessagingException
  {
    try
    {
      char c = getSeparator();
      int i = this.fullName.lastIndexOf(c);
      IMAPFolder localIMAPFolder;
      if (i != -1)
        localIMAPFolder = new IMAPFolder(this.fullName.substring(0, i), c, (IMAPStore)this.store);
      DefaultFolder localDefaultFolder;
      for (Object localObject2 = localIMAPFolder; ; localObject2 = localDefaultFolder)
      {
        return localObject2;
        localDefaultFolder = new DefaultFolder((IMAPStore)this.store);
      }
    }
    finally
    {
    }
  }

  public Flags getPermanentFlags()
  {
    try
    {
      Flags localFlags = (Flags)this.permanentFlags.clone();
      return localFlags;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public Quota[] getQuota()
    throws MessagingException
  {
    return (Quota[])doOptionalCommand("QUOTA not supported", new ProtocolCommand()
    {
      public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
        throws ProtocolException
      {
        return paramAnonymousIMAPProtocol.getQuotaRoot(IMAPFolder.this.fullName);
      }
    });
  }

  public char getSeparator()
    throws MessagingException
  {
    try
    {
      ListInfo[] arrayOfListInfo;
      if (this.separator == 65535)
      {
        ((ListInfo[])null);
        arrayOfListInfo = (ListInfo[])doCommand(new ProtocolCommand()
        {
          public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
            throws ProtocolException
          {
            if (paramAnonymousIMAPProtocol.isREV1())
              return paramAnonymousIMAPProtocol.list(IMAPFolder.this.fullName, "");
            return paramAnonymousIMAPProtocol.list("", IMAPFolder.this.fullName);
          }
        });
        if (arrayOfListInfo == null)
          break label58;
      }
      label58: for (this.separator = arrayOfListInfo[0].separator; ; this.separator = '/')
      {
        char c = this.separator;
        return c;
      }
    }
    finally
    {
    }
  }

  protected IMAPProtocol getStoreProtocol()
    throws ProtocolException
  {
    try
    {
      if (this.connectionPoolDebug)
        this.out.println("DEBUG: getStoreProtocol() - borrowing a connection");
      IMAPProtocol localIMAPProtocol = ((IMAPStore)this.store).getStoreProtocol();
      return localIMAPProtocol;
    }
    finally
    {
    }
  }

  public int getType()
    throws MessagingException
  {
    try
    {
      if (this.opened)
        if (this.attributes == null)
          exists();
      while (true)
      {
        int i = this.type;
        return i;
        checkExists();
      }
    }
    finally
    {
    }
  }

  public long getUID(Message paramMessage)
    throws MessagingException
  {
    try
    {
      if (paramMessage.getFolder() != this)
        throw new NoSuchElementException("Message does not belong to this folder");
    }
    finally
    {
    }
    checkOpened();
    IMAPMessage localIMAPMessage = (IMAPMessage)paramMessage;
    long l1 = localIMAPMessage.getUID();
    long l2 = l1;
    long l3;
    if (l2 != -1L)
      l3 = l2;
    while (true)
    {
      return l3;
      try
      {
        synchronized (this.messageCacheLock)
        {
          try
          {
            IMAPProtocol localIMAPProtocol = getProtocol();
            localIMAPMessage.checkExpunged();
            UID localUID = localIMAPProtocol.fetchUID(localIMAPMessage.getSequenceNumber());
            if (localUID != null)
            {
              l2 = localUID.uid;
              localIMAPMessage.setUID(l2);
              if (this.uidTable == null)
                this.uidTable = new Hashtable();
              this.uidTable.put(new Long(l2), localIMAPMessage);
            }
            l3 = l2;
          }
          catch (ConnectionException localConnectionException)
          {
            throw new FolderClosedException(this, localConnectionException.getMessage());
          }
        }
      }
      catch (ProtocolException localProtocolException)
      {
        throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
      }
    }
  }

  // ERROR //
  public long getUIDNext()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   6: ifeq +14 -> 20
    //   9: aload_0
    //   10: getfield 116	com/sun/mail/imap/IMAPFolder:uidnext	J
    //   13: lstore 7
    //   15: aload_0
    //   16: monitorexit
    //   17: lload 7
    //   19: lreturn
    //   20: aconst_null
    //   21: astore_2
    //   22: aload_0
    //   23: invokevirtual 363	com/sun/mail/imap/IMAPFolder:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   26: astore_2
    //   27: iconst_1
    //   28: anewarray 167	java/lang/String
    //   31: dup
    //   32: iconst_0
    //   33: ldc_w 802
    //   36: aastore
    //   37: astore 10
    //   39: aload_2
    //   40: aload_0
    //   41: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   44: aload 10
    //   46: invokevirtual 367	com/sun/mail/imap/protocol/IMAPProtocol:status	(Ljava/lang/String;[Ljava/lang/String;)Lcom/sun/mail/imap/protocol/Status;
    //   49: astore 11
    //   51: aload 11
    //   53: astore 6
    //   55: aload_0
    //   56: aload_2
    //   57: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   60: aload 6
    //   62: getfield 803	com/sun/mail/imap/protocol/Status:uidnext	J
    //   65: lstore 7
    //   67: goto -52 -> 15
    //   70: astore 9
    //   72: new 201	javax/mail/MessagingException
    //   75: dup
    //   76: ldc_w 805
    //   79: aload 9
    //   81: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   84: athrow
    //   85: astore 4
    //   87: aload_0
    //   88: aload_2
    //   89: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   92: aload 4
    //   94: athrow
    //   95: astore_1
    //   96: aload_0
    //   97: monitorexit
    //   98: aload_1
    //   99: athrow
    //   100: astore 5
    //   102: aload_0
    //   103: aload 5
    //   105: invokespecial 550	com/sun/mail/imap/IMAPFolder:throwClosedException	(Lcom/sun/mail/iap/ConnectionException;)V
    //   108: aload_0
    //   109: aload_2
    //   110: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   113: aconst_null
    //   114: astore 6
    //   116: goto -56 -> 60
    //   119: astore_3
    //   120: new 201	javax/mail/MessagingException
    //   123: dup
    //   124: aload_3
    //   125: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   128: aload_3
    //   129: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   132: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   22	51	70	com/sun/mail/iap/BadCommandException
    //   22	51	85	finally
    //   72	85	85	finally
    //   102	108	85	finally
    //   120	133	85	finally
    //   2	15	95	finally
    //   55	60	95	finally
    //   60	67	95	finally
    //   87	95	95	finally
    //   108	113	95	finally
    //   22	51	100	com/sun/mail/iap/ConnectionException
    //   22	51	119	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public long getUIDValidity()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   6: ifeq +14 -> 20
    //   9: aload_0
    //   10: getfield 114	com/sun/mail/imap/IMAPFolder:uidvalidity	J
    //   13: lstore 7
    //   15: aload_0
    //   16: monitorexit
    //   17: lload 7
    //   19: lreturn
    //   20: aconst_null
    //   21: astore_2
    //   22: aload_0
    //   23: invokevirtual 363	com/sun/mail/imap/IMAPFolder:getStoreProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   26: astore_2
    //   27: iconst_1
    //   28: anewarray 167	java/lang/String
    //   31: dup
    //   32: iconst_0
    //   33: ldc_w 808
    //   36: aastore
    //   37: astore 10
    //   39: aload_2
    //   40: aload_0
    //   41: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   44: aload 10
    //   46: invokevirtual 367	com/sun/mail/imap/protocol/IMAPProtocol:status	(Ljava/lang/String;[Ljava/lang/String;)Lcom/sun/mail/imap/protocol/Status;
    //   49: astore 11
    //   51: aload 11
    //   53: astore 6
    //   55: aload_0
    //   56: aload_2
    //   57: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   60: aload 6
    //   62: getfield 809	com/sun/mail/imap/protocol/Status:uidvalidity	J
    //   65: lstore 7
    //   67: goto -52 -> 15
    //   70: astore 9
    //   72: new 201	javax/mail/MessagingException
    //   75: dup
    //   76: ldc_w 811
    //   79: aload 9
    //   81: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   84: athrow
    //   85: astore 4
    //   87: aload_0
    //   88: aload_2
    //   89: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   92: aload 4
    //   94: athrow
    //   95: astore_1
    //   96: aload_0
    //   97: monitorexit
    //   98: aload_1
    //   99: athrow
    //   100: astore 5
    //   102: aload_0
    //   103: aload 5
    //   105: invokespecial 550	com/sun/mail/imap/IMAPFolder:throwClosedException	(Lcom/sun/mail/iap/ConnectionException;)V
    //   108: aload_0
    //   109: aload_2
    //   110: invokevirtual 371	com/sun/mail/imap/IMAPFolder:releaseStoreProtocol	(Lcom/sun/mail/imap/protocol/IMAPProtocol;)V
    //   113: aconst_null
    //   114: astore 6
    //   116: goto -56 -> 60
    //   119: astore_3
    //   120: new 201	javax/mail/MessagingException
    //   123: dup
    //   124: aload_3
    //   125: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   128: aload_3
    //   129: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   132: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   22	51	70	com/sun/mail/iap/BadCommandException
    //   22	51	85	finally
    //   72	85	85	finally
    //   102	108	85	finally
    //   120	133	85	finally
    //   2	15	95	finally
    //   55	60	95	finally
    //   60	67	95	finally
    //   87	95	95	finally
    //   108	113	95	finally
    //   22	51	100	com/sun/mail/iap/ConnectionException
    //   22	51	119	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public int getUnreadMessageCount()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   6: ifne +70 -> 76
    //   9: aload_0
    //   10: invokespecial 323	com/sun/mail/imap/IMAPFolder:checkExists	()V
    //   13: aload_0
    //   14: invokespecial 188	com/sun/mail/imap/IMAPFolder:getStatus	()Lcom/sun/mail/imap/protocol/Status;
    //   17: getfield 815	com/sun/mail/imap/protocol/Status:unseen	I
    //   20: istore 7
    //   22: aload_0
    //   23: monitorexit
    //   24: iload 7
    //   26: ireturn
    //   27: astore 10
    //   29: iconst_m1
    //   30: istore 7
    //   32: goto -10 -> 22
    //   35: astore 9
    //   37: new 408	javax/mail/StoreClosedException
    //   40: dup
    //   41: aload_0
    //   42: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   45: aload 9
    //   47: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   50: invokespecial 414	javax/mail/StoreClosedException:<init>	(Ljavax/mail/Store;Ljava/lang/String;)V
    //   53: athrow
    //   54: astore_1
    //   55: aload_0
    //   56: monitorexit
    //   57: aload_1
    //   58: athrow
    //   59: astore 8
    //   61: new 201	javax/mail/MessagingException
    //   64: dup
    //   65: aload 8
    //   67: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   70: aload 8
    //   72: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   75: athrow
    //   76: new 672	javax/mail/Flags
    //   79: dup
    //   80: invokespecial 673	javax/mail/Flags:<init>	()V
    //   83: astore_2
    //   84: aload_2
    //   85: getstatic 818	javax/mail/Flags$Flag:SEEN	Ljavax/mail/Flags$Flag;
    //   88: invokevirtual 682	javax/mail/Flags:add	(Ljavax/mail/Flags$Flag;)V
    //   91: aload_0
    //   92: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   95: astore 5
    //   97: aload 5
    //   99: monitorenter
    //   100: aload_0
    //   101: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   104: new 684	javax/mail/search/FlagTerm
    //   107: dup
    //   108: aload_2
    //   109: iconst_0
    //   110: invokespecial 687	javax/mail/search/FlagTerm:<init>	(Ljavax/mail/Flags;Z)V
    //   113: invokevirtual 691	com/sun/mail/imap/protocol/IMAPProtocol:search	(Ljavax/mail/search/SearchTerm;)[I
    //   116: arraylength
    //   117: istore 7
    //   119: aload 5
    //   121: monitorexit
    //   122: goto -100 -> 22
    //   125: astore 6
    //   127: aload 5
    //   129: monitorexit
    //   130: aload 6
    //   132: athrow
    //   133: astore 4
    //   135: new 244	javax/mail/FolderClosedException
    //   138: dup
    //   139: aload_0
    //   140: aload 4
    //   142: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   145: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   148: athrow
    //   149: astore_3
    //   150: new 201	javax/mail/MessagingException
    //   153: dup
    //   154: aload_3
    //   155: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   158: aload_3
    //   159: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   162: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   13	22	27	com/sun/mail/iap/BadCommandException
    //   13	22	35	com/sun/mail/iap/ConnectionException
    //   2	13	54	finally
    //   13	22	54	finally
    //   37	54	54	finally
    //   61	76	54	finally
    //   76	91	54	finally
    //   91	100	54	finally
    //   130	133	54	finally
    //   135	149	54	finally
    //   150	163	54	finally
    //   13	22	59	com/sun/mail/iap/ProtocolException
    //   100	122	125	finally
    //   127	130	125	finally
    //   91	100	133	com/sun/mail/iap/ConnectionException
    //   130	133	133	com/sun/mail/iap/ConnectionException
    //   91	100	149	com/sun/mail/iap/ProtocolException
    //   130	133	149	com/sun/mail/iap/ProtocolException
  }

  public void handleResponse(Response paramResponse)
  {
    assert (Thread.holdsLock(this.messageCacheLock));
    if ((paramResponse.isOK()) || (paramResponse.isNO()) || (paramResponse.isBAD()) || (paramResponse.isBYE()))
      ((IMAPStore)this.store).handleResponseCode(paramResponse);
    if (paramResponse.isBYE())
      if (this.opened)
        cleanup(false);
    label82: IMAPResponse localIMAPResponse;
    label386: 
    do
    {
      Flags localFlags;
      IMAPMessage localIMAPMessage1;
      do
      {
        FetchResponse localFetchResponse;
        do
        {
          IMAPMessage localIMAPMessage2;
          int i;
          do
          {
            int j;
            do
            {
              break label82;
              break label82;
              break label82;
              do
                return;
              while ((paramResponse.isOK()) || (!paramResponse.isUnTagged()));
              if (!(paramResponse instanceof IMAPResponse))
              {
                this.out.println("UNEXPECTED RESPONSE : " + paramResponse.toString());
                this.out.println("CONTACT javamail@sun.com");
                return;
              }
              localIMAPResponse = (IMAPResponse)paramResponse;
              if (!localIMAPResponse.keyEquals("EXISTS"))
                break;
              j = localIMAPResponse.getNumber();
            }
            while (j <= this.realTotal);
            int k = j - this.realTotal;
            Message[] arrayOfMessage = new Message[k];
            for (int m = 0; ; m++)
            {
              if (m >= k)
              {
                notifyMessageAddedListeners(arrayOfMessage);
                return;
              }
              int n = 1 + this.total;
              this.total = n;
              int i1 = 1 + this.realTotal;
              this.realTotal = i1;
              IMAPMessage localIMAPMessage4 = new IMAPMessage(this, n, i1);
              arrayOfMessage[m] = localIMAPMessage4;
              this.messageCache.addElement(localIMAPMessage4);
            }
            if (!localIMAPResponse.keyEquals("EXPUNGE"))
              break label386;
            localIMAPMessage2 = getMessageBySeqNumber(localIMAPResponse.getNumber());
            localIMAPMessage2.setExpunged(true);
            i = localIMAPMessage2.getMessageNumber();
            if (i < this.total)
              break;
            this.realTotal = (-1 + this.realTotal);
          }
          while (!this.doExpungeNotification);
          notifyMessageRemovedListeners(false, new Message[] { localIMAPMessage2 });
          return;
          IMAPMessage localIMAPMessage3 = (IMAPMessage)this.messageCache.elementAt(i);
          if (localIMAPMessage3.isExpunged());
          while (true)
          {
            i++;
            break;
            localIMAPMessage3.setSequenceNumber(-1 + localIMAPMessage3.getSequenceNumber());
          }
          if (!localIMAPResponse.keyEquals("FETCH"))
            break;
          assert ((localIMAPResponse instanceof FetchResponse)) : "!ir instanceof FetchResponse";
          localFetchResponse = (FetchResponse)localIMAPResponse;
          localFlags = (Flags)localFetchResponse.getItem(Flags.class);
        }
        while (localFlags == null);
        localIMAPMessage1 = getMessageBySeqNumber(localFetchResponse.getNumber());
      }
      while (localIMAPMessage1 == null);
      localIMAPMessage1._setFlags(localFlags);
      notifyMessageChangedListeners(1, localIMAPMessage1);
      return;
    }
    while (!localIMAPResponse.keyEquals("RECENT"));
    this.recent = localIMAPResponse.getNumber();
  }

  void handleResponses(Response[] paramArrayOfResponse)
  {
    for (int i = 0; ; i++)
    {
      if (i >= paramArrayOfResponse.length)
        return;
      if (paramArrayOfResponse[i] != null)
        handleResponse(paramArrayOfResponse[i]);
    }
  }

  // ERROR //
  public boolean hasNewMessages()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   6: ifeq +85 -> 91
    //   9: aload_0
    //   10: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   13: astore 5
    //   15: aload 5
    //   17: monitorenter
    //   18: aload_0
    //   19: iconst_1
    //   20: invokespecial 260	com/sun/mail/imap/IMAPFolder:keepConnectionAlive	(Z)V
    //   23: aload_0
    //   24: getfield 108	com/sun/mail/imap/IMAPFolder:recent	I
    //   27: istore 9
    //   29: iconst_0
    //   30: istore_3
    //   31: iload 9
    //   33: ifle +5 -> 38
    //   36: iconst_1
    //   37: istore_3
    //   38: aload 5
    //   40: monitorexit
    //   41: aload_0
    //   42: monitorexit
    //   43: iload_3
    //   44: ireturn
    //   45: astore 8
    //   47: new 244	javax/mail/FolderClosedException
    //   50: dup
    //   51: aload_0
    //   52: aload 8
    //   54: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   57: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   60: athrow
    //   61: astore 7
    //   63: aload 5
    //   65: monitorexit
    //   66: aload 7
    //   68: athrow
    //   69: astore_1
    //   70: aload_0
    //   71: monitorexit
    //   72: aload_1
    //   73: athrow
    //   74: astore 6
    //   76: new 201	javax/mail/MessagingException
    //   79: dup
    //   80: aload 6
    //   82: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   85: aload 6
    //   87: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   90: athrow
    //   91: aload_0
    //   92: invokespecial 323	com/sun/mail/imap/IMAPFolder:checkExists	()V
    //   95: aload_0
    //   96: new 902	com/sun/mail/imap/IMAPFolder$7
    //   99: dup
    //   100: aload_0
    //   101: invokespecial 903	com/sun/mail/imap/IMAPFolder$7:<init>	(Lcom/sun/mail/imap/IMAPFolder;)V
    //   104: invokevirtual 339	com/sun/mail/imap/IMAPFolder:doCommandIgnoreFailure	(Lcom/sun/mail/imap/IMAPFolder$ProtocolCommand;)Ljava/lang/Object;
    //   107: checkcast 905	java/lang/Boolean
    //   110: astore_2
    //   111: iconst_0
    //   112: istore_3
    //   113: aload_2
    //   114: ifnull -73 -> 41
    //   117: aload_2
    //   118: invokevirtual 908	java/lang/Boolean:booleanValue	()Z
    //   121: istore 4
    //   123: iload 4
    //   125: istore_3
    //   126: goto -85 -> 41
    //
    // Exception table:
    //   from	to	target	type
    //   18	23	45	com/sun/mail/iap/ConnectionException
    //   18	23	61	finally
    //   23	29	61	finally
    //   38	41	61	finally
    //   47	61	61	finally
    //   63	66	61	finally
    //   76	91	61	finally
    //   2	18	69	finally
    //   66	69	69	finally
    //   91	111	69	finally
    //   117	123	69	finally
    //   18	23	74	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public void idle()
    throws MessagingException
  {
    // Byte code:
    //   0: getstatic 67	com/sun/mail/imap/IMAPFolder:$assertionsDisabled	Z
    //   3: ifne +18 -> 21
    //   6: aload_0
    //   7: invokestatic 233	java/lang/Thread:holdsLock	(Ljava/lang/Object;)Z
    //   10: ifeq +11 -> 21
    //   13: new 235	java/lang/AssertionError
    //   16: dup
    //   17: invokespecial 236	java/lang/AssertionError:<init>	()V
    //   20: athrow
    //   21: aload_0
    //   22: monitorenter
    //   23: aload_0
    //   24: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   27: aload_0
    //   28: ldc_w 913
    //   31: new 915	com/sun/mail/imap/IMAPFolder$19
    //   34: dup
    //   35: aload_0
    //   36: invokespecial 916	com/sun/mail/imap/IMAPFolder$19:<init>	(Lcom/sun/mail/imap/IMAPFolder;)V
    //   39: invokevirtual 404	com/sun/mail/imap/IMAPFolder:doOptionalCommand	(Ljava/lang/String;Lcom/sun/mail/imap/IMAPFolder$ProtocolCommand;)Ljava/lang/Object;
    //   42: checkcast 905	java/lang/Boolean
    //   45: invokevirtual 908	java/lang/Boolean:booleanValue	()Z
    //   48: ifne +6 -> 54
    //   51: aload_0
    //   52: monitorexit
    //   53: return
    //   54: aload_0
    //   55: monitorexit
    //   56: aload_0
    //   57: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   60: invokevirtual 920	com/sun/mail/imap/protocol/IMAPProtocol:readIdleResponse	()Lcom/sun/mail/iap/Response;
    //   63: astore_2
    //   64: aload_0
    //   65: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   68: astore 5
    //   70: aload 5
    //   72: monitorenter
    //   73: aload_2
    //   74: ifnull +21 -> 95
    //   77: aload_0
    //   78: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   81: ifnull +14 -> 95
    //   84: aload_0
    //   85: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   88: aload_2
    //   89: invokevirtual 924	com/sun/mail/imap/protocol/IMAPProtocol:processIdleResponse	(Lcom/sun/mail/iap/Response;)Z
    //   92: ifne +54 -> 146
    //   95: aload_0
    //   96: iconst_0
    //   97: putfield 104	com/sun/mail/imap/IMAPFolder:idleState	I
    //   100: aload_0
    //   101: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   104: invokevirtual 927	java/lang/Object:notifyAll	()V
    //   107: aload 5
    //   109: monitorexit
    //   110: aload_0
    //   111: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   114: checkcast 142	com/sun/mail/imap/IMAPStore
    //   117: invokevirtual 930	com/sun/mail/imap/IMAPStore:getMinIdleTime	()I
    //   120: istore 7
    //   122: iload 7
    //   124: ifle +61 -> 185
    //   127: iload 7
    //   129: i2l
    //   130: lstore 8
    //   132: lload 8
    //   134: invokestatic 933	java/lang/Thread:sleep	(J)V
    //   137: return
    //   138: astore 10
    //   140: return
    //   141: astore_1
    //   142: aload_0
    //   143: monitorexit
    //   144: aload_1
    //   145: athrow
    //   146: aload 5
    //   148: monitorexit
    //   149: goto -93 -> 56
    //   152: astore 6
    //   154: aload 5
    //   156: monitorexit
    //   157: aload 6
    //   159: athrow
    //   160: astore 4
    //   162: aload_0
    //   163: aload 4
    //   165: invokespecial 550	com/sun/mail/imap/IMAPFolder:throwClosedException	(Lcom/sun/mail/iap/ConnectionException;)V
    //   168: goto -112 -> 56
    //   171: astore_3
    //   172: new 201	javax/mail/MessagingException
    //   175: dup
    //   176: aload_3
    //   177: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   180: aload_3
    //   181: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   184: athrow
    //   185: return
    //
    // Exception table:
    //   from	to	target	type
    //   132	137	138	java/lang/InterruptedException
    //   23	53	141	finally
    //   54	56	141	finally
    //   142	144	141	finally
    //   77	95	152	finally
    //   95	110	152	finally
    //   146	149	152	finally
    //   154	157	152	finally
    //   64	73	160	com/sun/mail/iap/ConnectionException
    //   157	160	160	com/sun/mail/iap/ConnectionException
    //   64	73	171	com/sun/mail/iap/ProtocolException
    //   157	160	171	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public boolean isOpen()
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   6: astore_2
    //   7: aload_2
    //   8: monitorenter
    //   9: aload_0
    //   10: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   13: istore 4
    //   15: iload 4
    //   17: ifeq +8 -> 25
    //   20: aload_0
    //   21: iconst_0
    //   22: invokespecial 260	com/sun/mail/imap/IMAPFolder:keepConnectionAlive	(Z)V
    //   25: aload_2
    //   26: monitorexit
    //   27: aload_0
    //   28: getfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   31: istore 5
    //   33: aload_0
    //   34: monitorexit
    //   35: iload 5
    //   37: ireturn
    //   38: astore_3
    //   39: aload_2
    //   40: monitorexit
    //   41: aload_3
    //   42: athrow
    //   43: astore_1
    //   44: aload_0
    //   45: monitorexit
    //   46: aload_1
    //   47: athrow
    //   48: astore 6
    //   50: goto -25 -> 25
    //
    // Exception table:
    //   from	to	target	type
    //   9	15	38	finally
    //   20	25	38	finally
    //   25	27	38	finally
    //   39	41	38	finally
    //   2	9	43	finally
    //   27	33	43	finally
    //   41	43	43	finally
    //   20	25	48	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public boolean isSubscribed()
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aconst_null
    //   3: checkcast 341	[Lcom/sun/mail/imap/protocol/ListInfo;
    //   6: astore_2
    //   7: aload_0
    //   8: getfield 98	com/sun/mail/imap/IMAPFolder:isNamespace	Z
    //   11: ifeq +78 -> 89
    //   14: aload_0
    //   15: getfield 134	com/sun/mail/imap/IMAPFolder:separator	C
    //   18: ifeq +71 -> 89
    //   21: new 207	java/lang/StringBuilder
    //   24: dup
    //   25: aload_0
    //   26: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   29: invokestatic 211	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   32: invokespecial 212	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   35: aload_0
    //   36: getfield 134	com/sun/mail/imap/IMAPFolder:separator	C
    //   39: invokevirtual 344	java/lang/StringBuilder:append	(C)Ljava/lang/StringBuilder;
    //   42: invokevirtual 222	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   45: astore 6
    //   47: aload 6
    //   49: astore_3
    //   50: aload_0
    //   51: new 937	com/sun/mail/imap/IMAPFolder$4
    //   54: dup
    //   55: aload_0
    //   56: aload_3
    //   57: invokespecial 938	com/sun/mail/imap/IMAPFolder$4:<init>	(Lcom/sun/mail/imap/IMAPFolder;Ljava/lang/String;)V
    //   60: invokevirtual 548	com/sun/mail/imap/IMAPFolder:doProtocolCommand	(Lcom/sun/mail/imap/IMAPFolder$ProtocolCommand;)Ljava/lang/Object;
    //   63: checkcast 341	[Lcom/sun/mail/imap/protocol/ListInfo;
    //   66: astore_2
    //   67: aload_2
    //   68: ifnull +29 -> 97
    //   71: aload_2
    //   72: aload_0
    //   73: aload_2
    //   74: aload_3
    //   75: invokespecial 564	com/sun/mail/imap/IMAPFolder:findName	([Lcom/sun/mail/imap/protocol/ListInfo;Ljava/lang/String;)I
    //   78: aaload
    //   79: getfield 86	com/sun/mail/imap/protocol/ListInfo:canOpen	Z
    //   82: istore 5
    //   84: aload_0
    //   85: monitorexit
    //   86: iload 5
    //   88: ireturn
    //   89: aload_0
    //   90: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   93: astore_3
    //   94: goto -44 -> 50
    //   97: iconst_0
    //   98: istore 5
    //   100: goto -16 -> 84
    //   103: astore_1
    //   104: aload_0
    //   105: monitorexit
    //   106: aload_1
    //   107: athrow
    //   108: astore 4
    //   110: goto -43 -> 67
    //
    // Exception table:
    //   from	to	target	type
    //   2	47	103	finally
    //   50	67	103	finally
    //   71	84	103	finally
    //   89	94	103	finally
    //   50	67	108	com/sun/mail/iap/ProtocolException
  }

  public Folder[] list(String paramString)
    throws MessagingException
  {
    return doList(paramString, false);
  }

  public Rights[] listRights(final String paramString)
    throws MessagingException
  {
    return (Rights[])doOptionalCommand("ACL not supported", new ProtocolCommand()
    {
      public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
        throws ProtocolException
      {
        return paramAnonymousIMAPProtocol.listRights(IMAPFolder.this.fullName, paramString);
      }
    });
  }

  public Folder[] listSubscribed(String paramString)
    throws MessagingException
  {
    return doList(paramString, true);
  }

  public Rights myRights()
    throws MessagingException
  {
    return (Rights)doOptionalCommand("ACL not supported", new ProtocolCommand()
    {
      public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
        throws ProtocolException
      {
        return paramAnonymousIMAPProtocol.myRights(IMAPFolder.this.fullName);
      }
    });
  }

  // ERROR //
  public void open(int paramInt)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 534	com/sun/mail/imap/IMAPFolder:checkClosed	()V
    //   6: aload_0
    //   7: aload_0
    //   8: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   11: checkcast 142	com/sun/mail/imap/IMAPStore
    //   14: aload_0
    //   15: invokevirtual 960	com/sun/mail/imap/IMAPStore:getProtocol	(Lcom/sun/mail/imap/IMAPFolder;)Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   18: putfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   21: aconst_null
    //   22: astore_3
    //   23: aload_0
    //   24: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   27: astore 4
    //   29: aload 4
    //   31: monitorenter
    //   32: aload_0
    //   33: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   36: aload_0
    //   37: invokevirtual 963	com/sun/mail/imap/protocol/IMAPProtocol:addResponseHandler	(Lcom/sun/mail/iap/ResponseHandler;)V
    //   40: iload_1
    //   41: iconst_1
    //   42: if_icmpne +202 -> 244
    //   45: aload_0
    //   46: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   49: aload_0
    //   50: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   53: invokevirtual 319	com/sun/mail/imap/protocol/IMAPProtocol:examine	(Ljava/lang/String;)Lcom/sun/mail/imap/protocol/MailboxInfo;
    //   56: astore 18
    //   58: aload 18
    //   60: astore 11
    //   62: aload 11
    //   64: getfield 964	com/sun/mail/imap/protocol/MailboxInfo:mode	I
    //   67: iload_1
    //   68: if_icmpeq +30 -> 98
    //   71: iload_1
    //   72: iconst_2
    //   73: if_icmpne +254 -> 327
    //   76: aload 11
    //   78: getfield 964	com/sun/mail/imap/protocol/MailboxInfo:mode	I
    //   81: iconst_1
    //   82: if_icmpne +245 -> 327
    //   85: aload_0
    //   86: getfield 305	com/sun/mail/imap/IMAPFolder:store	Ljavax/mail/Store;
    //   89: checkcast 142	com/sun/mail/imap/IMAPStore
    //   92: invokevirtual 967	com/sun/mail/imap/IMAPStore:allowReadOnlySelect	()Z
    //   95: ifeq +232 -> 327
    //   98: aload_0
    //   99: iconst_1
    //   100: putfield 100	com/sun/mail/imap/IMAPFolder:opened	Z
    //   103: aload_0
    //   104: iconst_0
    //   105: putfield 102	com/sun/mail/imap/IMAPFolder:reallyClosed	Z
    //   108: aload_0
    //   109: aload 11
    //   111: getfield 964	com/sun/mail/imap/protocol/MailboxInfo:mode	I
    //   114: putfield 239	com/sun/mail/imap/IMAPFolder:mode	I
    //   117: aload_0
    //   118: aload 11
    //   120: getfield 969	com/sun/mail/imap/protocol/MailboxInfo:availableFlags	Ljavax/mail/Flags;
    //   123: putfield 970	com/sun/mail/imap/IMAPFolder:availableFlags	Ljavax/mail/Flags;
    //   126: aload_0
    //   127: aload 11
    //   129: getfield 971	com/sun/mail/imap/protocol/MailboxInfo:permanentFlags	Ljavax/mail/Flags;
    //   132: putfield 768	com/sun/mail/imap/IMAPFolder:permanentFlags	Ljavax/mail/Flags;
    //   135: aload 11
    //   137: getfield 731	com/sun/mail/imap/protocol/MailboxInfo:total	I
    //   140: istore 16
    //   142: aload_0
    //   143: iload 16
    //   145: putfield 110	com/sun/mail/imap/IMAPFolder:realTotal	I
    //   148: aload_0
    //   149: iload 16
    //   151: putfield 106	com/sun/mail/imap/IMAPFolder:total	I
    //   154: aload_0
    //   155: aload 11
    //   157: getfield 758	com/sun/mail/imap/protocol/MailboxInfo:recent	I
    //   160: putfield 108	com/sun/mail/imap/IMAPFolder:recent	I
    //   163: aload_0
    //   164: aload 11
    //   166: getfield 972	com/sun/mail/imap/protocol/MailboxInfo:uidvalidity	J
    //   169: putfield 114	com/sun/mail/imap/IMAPFolder:uidvalidity	J
    //   172: aload_0
    //   173: aload 11
    //   175: getfield 973	com/sun/mail/imap/protocol/MailboxInfo:uidnext	J
    //   178: putfield 116	com/sun/mail/imap/IMAPFolder:uidnext	J
    //   181: aload_0
    //   182: new 574	java/util/Vector
    //   185: dup
    //   186: aload_0
    //   187: getfield 106	com/sun/mail/imap/IMAPFolder:total	I
    //   190: invokespecial 975	java/util/Vector:<init>	(I)V
    //   193: putfield 275	com/sun/mail/imap/IMAPFolder:messageCache	Ljava/util/Vector;
    //   196: iconst_0
    //   197: istore 17
    //   199: iload 17
    //   201: aload_0
    //   202: getfield 106	com/sun/mail/imap/IMAPFolder:total	I
    //   205: if_icmplt +188 -> 393
    //   208: aload 4
    //   210: monitorexit
    //   211: aload_3
    //   212: ifnull +223 -> 435
    //   215: aload_0
    //   216: invokespecial 323	com/sun/mail/imap/IMAPFolder:checkExists	()V
    //   219: iconst_1
    //   220: aload_0
    //   221: getfield 83	com/sun/mail/imap/IMAPFolder:type	I
    //   224: iand
    //   225: ifne +197 -> 422
    //   228: new 201	javax/mail/MessagingException
    //   231: dup
    //   232: ldc_w 977
    //   235: invokespecial 696	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   238: athrow
    //   239: astore_2
    //   240: aload_0
    //   241: monitorexit
    //   242: aload_2
    //   243: athrow
    //   244: aload_0
    //   245: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   248: aload_0
    //   249: getfield 133	com/sun/mail/imap/IMAPFolder:fullName	Ljava/lang/String;
    //   252: invokevirtual 980	com/sun/mail/imap/protocol/IMAPProtocol:select	(Ljava/lang/String;)Lcom/sun/mail/imap/protocol/MailboxInfo;
    //   255: astore 10
    //   257: aload 10
    //   259: astore 11
    //   261: goto -199 -> 62
    //   264: astore 9
    //   266: aload_0
    //   267: iconst_1
    //   268: invokespecial 271	com/sun/mail/imap/IMAPFolder:releaseProtocol	(Z)V
    //   271: aload_0
    //   272: aconst_null
    //   273: putfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   276: aload 9
    //   278: astore_3
    //   279: aload 4
    //   281: monitorexit
    //   282: goto -71 -> 211
    //   285: astore 5
    //   287: aload 4
    //   289: monitorexit
    //   290: aload 5
    //   292: athrow
    //   293: astore 6
    //   295: aload_0
    //   296: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   299: invokevirtual 315	com/sun/mail/imap/protocol/IMAPProtocol:logout	()V
    //   302: aload_0
    //   303: iconst_0
    //   304: invokespecial 271	com/sun/mail/imap/IMAPFolder:releaseProtocol	(Z)V
    //   307: aload_0
    //   308: aconst_null
    //   309: putfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   312: new 201	javax/mail/MessagingException
    //   315: dup
    //   316: aload 6
    //   318: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   321: aload 6
    //   323: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   326: athrow
    //   327: aload_0
    //   328: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   331: invokevirtual 312	com/sun/mail/imap/protocol/IMAPProtocol:close	()V
    //   334: aload_0
    //   335: iconst_1
    //   336: invokespecial 271	com/sun/mail/imap/IMAPFolder:releaseProtocol	(Z)V
    //   339: aload_0
    //   340: aconst_null
    //   341: putfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   344: new 982	javax/mail/ReadOnlyFolderException
    //   347: dup
    //   348: aload_0
    //   349: ldc_w 984
    //   352: invokespecial 985	javax/mail/ReadOnlyFolderException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   355: athrow
    //   356: astore 13
    //   358: aload_0
    //   359: getfield 273	com/sun/mail/imap/IMAPFolder:protocol	Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   362: invokevirtual 315	com/sun/mail/imap/protocol/IMAPProtocol:logout	()V
    //   365: aload_0
    //   366: iconst_0
    //   367: invokespecial 271	com/sun/mail/imap/IMAPFolder:releaseProtocol	(Z)V
    //   370: goto -31 -> 339
    //   373: astore 15
    //   375: aload_0
    //   376: iconst_0
    //   377: invokespecial 271	com/sun/mail/imap/IMAPFolder:releaseProtocol	(Z)V
    //   380: goto -41 -> 339
    //   383: astore 14
    //   385: aload_0
    //   386: iconst_0
    //   387: invokespecial 271	com/sun/mail/imap/IMAPFolder:releaseProtocol	(Z)V
    //   390: aload 14
    //   392: athrow
    //   393: aload_0
    //   394: getfield 275	com/sun/mail/imap/IMAPFolder:messageCache	Ljava/util/Vector;
    //   397: new 621	com/sun/mail/imap/IMAPMessage
    //   400: dup
    //   401: aload_0
    //   402: iload 17
    //   404: iconst_1
    //   405: iadd
    //   406: iload 17
    //   408: iconst_1
    //   409: iadd
    //   410: invokespecial 862	com/sun/mail/imap/IMAPMessage:<init>	(Lcom/sun/mail/imap/IMAPFolder;II)V
    //   413: invokevirtual 628	java/util/Vector:addElement	(Ljava/lang/Object;)V
    //   416: iinc 17 1
    //   419: goto -220 -> 199
    //   422: new 201	javax/mail/MessagingException
    //   425: dup
    //   426: aload_3
    //   427: invokevirtual 504	com/sun/mail/iap/CommandFailedException:getMessage	()Ljava/lang/String;
    //   430: aload_3
    //   431: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   434: athrow
    //   435: aload_0
    //   436: iconst_1
    //   437: putfield 88	com/sun/mail/imap/IMAPFolder:exists	Z
    //   440: aload_0
    //   441: aconst_null
    //   442: putfield 93	com/sun/mail/imap/IMAPFolder:attributes	[Ljava/lang/String;
    //   445: aload_0
    //   446: iconst_1
    //   447: putfield 83	com/sun/mail/imap/IMAPFolder:type	I
    //   450: aload_0
    //   451: iconst_1
    //   452: invokevirtual 280	com/sun/mail/imap/IMAPFolder:notifyConnectionListeners	(I)V
    //   455: aload_0
    //   456: monitorexit
    //   457: return
    //   458: astore 8
    //   460: goto -158 -> 302
    //   463: astore 7
    //   465: goto -163 -> 302
    //   468: astore 12
    //   470: goto -131 -> 339
    //
    // Exception table:
    //   from	to	target	type
    //   2	21	239	finally
    //   23	32	239	finally
    //   215	239	239	finally
    //   290	293	239	finally
    //   422	435	239	finally
    //   435	455	239	finally
    //   45	58	264	com/sun/mail/iap/CommandFailedException
    //   244	257	264	com/sun/mail/iap/CommandFailedException
    //   32	40	285	finally
    //   45	58	285	finally
    //   62	71	285	finally
    //   76	98	285	finally
    //   98	196	285	finally
    //   199	211	285	finally
    //   244	257	285	finally
    //   266	276	285	finally
    //   279	282	285	finally
    //   287	290	285	finally
    //   302	327	285	finally
    //   339	356	285	finally
    //   393	416	285	finally
    //   45	58	293	com/sun/mail/iap/ProtocolException
    //   244	257	293	com/sun/mail/iap/ProtocolException
    //   327	339	356	com/sun/mail/iap/ProtocolException
    //   358	365	373	com/sun/mail/iap/ProtocolException
    //   358	365	383	finally
    //   295	302	458	finally
    //   295	302	463	com/sun/mail/iap/ProtocolException
    //   327	339	468	finally
    //   365	370	468	finally
    //   375	380	468	finally
    //   385	393	468	finally
  }

  protected void releaseStoreProtocol(IMAPProtocol paramIMAPProtocol)
  {
    try
    {
      if (paramIMAPProtocol != this.protocol)
        ((IMAPStore)this.store).releaseStoreProtocol(paramIMAPProtocol);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void removeACL(final String paramString)
    throws MessagingException
  {
    doOptionalCommand("ACL not supported", new ProtocolCommand()
    {
      public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
        throws ProtocolException
      {
        paramAnonymousIMAPProtocol.deleteACL(IMAPFolder.this.fullName, paramString);
        return null;
      }
    });
  }

  public void removeRights(ACL paramACL)
    throws MessagingException
  {
    setACL(paramACL, '-');
  }

  public boolean renameTo(final Folder paramFolder)
    throws MessagingException
  {
    try
    {
      checkClosed();
      checkExists();
      if (paramFolder.getStore() != this.store)
        throw new MessagingException("Can't rename across Stores");
    }
    finally
    {
    }
    Object localObject2 = doCommandIgnoreFailure(new ProtocolCommand()
    {
      public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
        throws ProtocolException
      {
        paramAnonymousIMAPProtocol.rename(IMAPFolder.this.fullName, paramFolder.getFullName());
        return Boolean.TRUE;
      }
    });
    boolean bool = false;
    if (localObject2 == null);
    while (true)
    {
      return bool;
      this.exists = false;
      this.attributes = null;
      notifyFolderRenamedListeners(paramFolder);
      bool = true;
    }
  }

  // ERROR //
  public Message[] search(javax.mail.search.SearchTerm paramSearchTerm)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: aconst_null
    //   7: checkcast 1008	[Ljavax/mail/Message;
    //   10: astore 6
    //   12: aload_0
    //   13: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   16: astore 8
    //   18: aload 8
    //   20: monitorenter
    //   21: aload_0
    //   22: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   25: aload_1
    //   26: invokevirtual 691	com/sun/mail/imap/protocol/IMAPProtocol:search	(Ljavax/mail/search/SearchTerm;)[I
    //   29: astore 10
    //   31: aload 10
    //   33: ifnull +22 -> 55
    //   36: aload 10
    //   38: arraylength
    //   39: anewarray 621	com/sun/mail/imap/IMAPMessage
    //   42: astore 6
    //   44: iconst_0
    //   45: istore 11
    //   47: iload 11
    //   49: aload 10
    //   51: arraylength
    //   52: if_icmplt +11 -> 63
    //   55: aload 8
    //   57: monitorexit
    //   58: aload_0
    //   59: monitorexit
    //   60: aload 6
    //   62: areturn
    //   63: aload 6
    //   65: iload 11
    //   67: aload_0
    //   68: aload 10
    //   70: iload 11
    //   72: iaload
    //   73: invokevirtual 716	com/sun/mail/imap/IMAPFolder:getMessageBySeqNumber	(I)Lcom/sun/mail/imap/IMAPMessage;
    //   76: aastore
    //   77: iinc 11 1
    //   80: goto -33 -> 47
    //   83: astore 9
    //   85: aload 8
    //   87: monitorexit
    //   88: aload 9
    //   90: athrow
    //   91: astore 7
    //   93: aload_0
    //   94: aload_1
    //   95: invokespecial 1010	javax/mail/Folder:search	(Ljavax/mail/search/SearchTerm;)[Ljavax/mail/Message;
    //   98: astore 6
    //   100: goto -42 -> 58
    //   103: astore 5
    //   105: aload_0
    //   106: aload_1
    //   107: invokespecial 1010	javax/mail/Folder:search	(Ljavax/mail/search/SearchTerm;)[Ljavax/mail/Message;
    //   110: astore 6
    //   112: goto -54 -> 58
    //   115: astore 4
    //   117: new 244	javax/mail/FolderClosedException
    //   120: dup
    //   121: aload_0
    //   122: aload 4
    //   124: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   127: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   130: athrow
    //   131: astore_2
    //   132: aload_0
    //   133: monitorexit
    //   134: aload_2
    //   135: athrow
    //   136: astore_3
    //   137: new 201	javax/mail/MessagingException
    //   140: dup
    //   141: aload_3
    //   142: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   145: aload_3
    //   146: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   149: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   21	31	83	finally
    //   36	44	83	finally
    //   47	55	83	finally
    //   55	58	83	finally
    //   63	77	83	finally
    //   85	88	83	finally
    //   6	21	91	com/sun/mail/iap/CommandFailedException
    //   88	91	91	com/sun/mail/iap/CommandFailedException
    //   6	21	103	javax/mail/search/SearchException
    //   88	91	103	javax/mail/search/SearchException
    //   6	21	115	com/sun/mail/iap/ConnectionException
    //   88	91	115	com/sun/mail/iap/ConnectionException
    //   2	6	131	finally
    //   6	21	131	finally
    //   88	91	131	finally
    //   93	100	131	finally
    //   105	112	131	finally
    //   117	131	131	finally
    //   137	150	131	finally
    //   6	21	136	com/sun/mail/iap/ProtocolException
    //   88	91	136	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public Message[] search(javax.mail.search.SearchTerm paramSearchTerm, Message[] paramArrayOfMessage)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: aload_2
    //   7: arraylength
    //   8: istore 4
    //   10: iload 4
    //   12: ifne +7 -> 19
    //   15: aload_0
    //   16: monitorexit
    //   17: aload_2
    //   18: areturn
    //   19: aconst_null
    //   20: checkcast 1008	[Ljavax/mail/Message;
    //   23: astore 10
    //   25: aload_0
    //   26: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   29: astore 11
    //   31: aload 11
    //   33: monitorenter
    //   34: aload_0
    //   35: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   38: astore 13
    //   40: aload_2
    //   41: aconst_null
    //   42: invokestatic 500	com/sun/mail/imap/Utility:toMessageSet	([Ljavax/mail/Message;Lcom/sun/mail/imap/Utility$Condition;)[Lcom/sun/mail/imap/protocol/MessageSet;
    //   45: astore 14
    //   47: aload 14
    //   49: ifnonnull +38 -> 87
    //   52: new 445	javax/mail/MessageRemovedException
    //   55: dup
    //   56: ldc_w 502
    //   59: invokespecial 503	javax/mail/MessageRemovedException:<init>	(Ljava/lang/String;)V
    //   62: athrow
    //   63: astore 12
    //   65: aload 11
    //   67: monitorexit
    //   68: aload 12
    //   70: athrow
    //   71: astore 8
    //   73: aload_0
    //   74: aload_1
    //   75: aload_2
    //   76: invokespecial 1013	javax/mail/Folder:search	(Ljavax/mail/search/SearchTerm;[Ljavax/mail/Message;)[Ljavax/mail/Message;
    //   79: astore 9
    //   81: aload 9
    //   83: astore_2
    //   84: goto -69 -> 15
    //   87: aload 13
    //   89: aload 14
    //   91: aload_1
    //   92: invokevirtual 1016	com/sun/mail/imap/protocol/IMAPProtocol:search	([Lcom/sun/mail/imap/protocol/MessageSet;Ljavax/mail/search/SearchTerm;)[I
    //   95: astore 15
    //   97: aload 15
    //   99: ifnull +22 -> 121
    //   102: aload 15
    //   104: arraylength
    //   105: anewarray 621	com/sun/mail/imap/IMAPMessage
    //   108: astore 10
    //   110: iconst_0
    //   111: istore 16
    //   113: iload 16
    //   115: aload 15
    //   117: arraylength
    //   118: if_icmplt +12 -> 130
    //   121: aload 11
    //   123: monitorexit
    //   124: aload 10
    //   126: astore_2
    //   127: goto -112 -> 15
    //   130: aload 10
    //   132: iload 16
    //   134: aload_0
    //   135: aload 15
    //   137: iload 16
    //   139: iaload
    //   140: invokevirtual 716	com/sun/mail/imap/IMAPFolder:getMessageBySeqNumber	(I)Lcom/sun/mail/imap/IMAPMessage;
    //   143: aastore
    //   144: iinc 16 1
    //   147: goto -34 -> 113
    //   150: astore 7
    //   152: aload_0
    //   153: aload_1
    //   154: aload_2
    //   155: invokespecial 1013	javax/mail/Folder:search	(Ljavax/mail/search/SearchTerm;[Ljavax/mail/Message;)[Ljavax/mail/Message;
    //   158: astore_2
    //   159: goto -144 -> 15
    //   162: astore 6
    //   164: new 244	javax/mail/FolderClosedException
    //   167: dup
    //   168: aload_0
    //   169: aload 6
    //   171: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   174: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   177: athrow
    //   178: astore_3
    //   179: aload_0
    //   180: monitorexit
    //   181: aload_3
    //   182: athrow
    //   183: astore 5
    //   185: new 201	javax/mail/MessagingException
    //   188: dup
    //   189: aload 5
    //   191: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   194: aload 5
    //   196: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   199: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   34	47	63	finally
    //   52	63	63	finally
    //   65	68	63	finally
    //   87	97	63	finally
    //   102	110	63	finally
    //   113	121	63	finally
    //   121	124	63	finally
    //   130	144	63	finally
    //   19	34	71	com/sun/mail/iap/CommandFailedException
    //   68	71	71	com/sun/mail/iap/CommandFailedException
    //   19	34	150	javax/mail/search/SearchException
    //   68	71	150	javax/mail/search/SearchException
    //   19	34	162	com/sun/mail/iap/ConnectionException
    //   68	71	162	com/sun/mail/iap/ConnectionException
    //   2	10	178	finally
    //   19	34	178	finally
    //   68	71	178	finally
    //   73	81	178	finally
    //   152	159	178	finally
    //   164	178	178	finally
    //   185	200	178	finally
    //   19	34	183	com/sun/mail/iap/ProtocolException
    //   68	71	183	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  public void setFlags(Message[] paramArrayOfMessage, Flags paramFlags, boolean paramBoolean)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokespecial 422	com/sun/mail/imap/IMAPFolder:checkOpened	()V
    //   6: aload_0
    //   7: aload_2
    //   8: invokespecial 1020	com/sun/mail/imap/IMAPFolder:checkFlags	(Ljavax/mail/Flags;)V
    //   11: aload_1
    //   12: arraylength
    //   13: istore 5
    //   15: iload 5
    //   17: ifne +6 -> 23
    //   20: aload_0
    //   21: monitorexit
    //   22: return
    //   23: aload_0
    //   24: getfield 140	com/sun/mail/imap/IMAPFolder:messageCacheLock	Ljava/lang/Object;
    //   27: astore 6
    //   29: aload 6
    //   31: monitorenter
    //   32: aload_0
    //   33: invokespecial 494	com/sun/mail/imap/IMAPFolder:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   36: astore 10
    //   38: aload_1
    //   39: aconst_null
    //   40: invokestatic 500	com/sun/mail/imap/Utility:toMessageSet	([Ljavax/mail/Message;Lcom/sun/mail/imap/Utility$Condition;)[Lcom/sun/mail/imap/protocol/MessageSet;
    //   43: astore 11
    //   45: aload 11
    //   47: ifnonnull +45 -> 92
    //   50: new 445	javax/mail/MessageRemovedException
    //   53: dup
    //   54: ldc_w 502
    //   57: invokespecial 503	javax/mail/MessageRemovedException:<init>	(Ljava/lang/String;)V
    //   60: athrow
    //   61: astore 9
    //   63: new 244	javax/mail/FolderClosedException
    //   66: dup
    //   67: aload_0
    //   68: aload 9
    //   70: invokevirtual 263	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   73: invokespecial 249	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   76: athrow
    //   77: astore 8
    //   79: aload 6
    //   81: monitorexit
    //   82: aload 8
    //   84: athrow
    //   85: astore 4
    //   87: aload_0
    //   88: monitorexit
    //   89: aload 4
    //   91: athrow
    //   92: aload 10
    //   94: aload 11
    //   96: aload_2
    //   97: iload_3
    //   98: invokevirtual 1024	com/sun/mail/imap/protocol/IMAPProtocol:storeFlags	([Lcom/sun/mail/imap/protocol/MessageSet;Ljavax/mail/Flags;Z)V
    //   101: aload 6
    //   103: monitorexit
    //   104: goto -84 -> 20
    //   107: astore 7
    //   109: new 201	javax/mail/MessagingException
    //   112: dup
    //   113: aload 7
    //   115: invokevirtual 264	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   118: aload 7
    //   120: invokespecial 267	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   123: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   32	45	61	com/sun/mail/iap/ConnectionException
    //   50	61	61	com/sun/mail/iap/ConnectionException
    //   92	101	61	com/sun/mail/iap/ConnectionException
    //   32	45	77	finally
    //   50	61	77	finally
    //   63	77	77	finally
    //   79	82	77	finally
    //   92	101	77	finally
    //   101	104	77	finally
    //   109	124	77	finally
    //   2	15	85	finally
    //   23	32	85	finally
    //   82	85	85	finally
    //   32	45	107	com/sun/mail/iap/ProtocolException
    //   50	61	107	com/sun/mail/iap/ProtocolException
    //   92	101	107	com/sun/mail/iap/ProtocolException
  }

  public void setQuota(final Quota paramQuota)
    throws MessagingException
  {
    doOptionalCommand("QUOTA not supported", new ProtocolCommand()
    {
      public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
        throws ProtocolException
      {
        paramAnonymousIMAPProtocol.setQuota(paramQuota);
        return null;
      }
    });
  }

  public void setSubscribed(final boolean paramBoolean)
    throws MessagingException
  {
    try
    {
      doCommandIgnoreFailure(new ProtocolCommand()
      {
        public Object doCommand(IMAPProtocol paramAnonymousIMAPProtocol)
          throws ProtocolException
        {
          if (paramBoolean)
            paramAnonymousIMAPProtocol.subscribe(IMAPFolder.this.fullName);
          while (true)
          {
            return null;
            paramAnonymousIMAPProtocol.unsubscribe(IMAPFolder.this.fullName);
          }
        }
      });
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  void waitIfIdle()
    throws ProtocolException
  {
    if ((!$assertionsDisabled) && (!Thread.holdsLock(this.messageCacheLock)))
      throw new AssertionError();
    while (true)
    {
      if (this.idleState == 1)
      {
        this.protocol.idleAbort();
        this.idleState = 2;
      }
      try
      {
        this.messageCacheLock.wait();
        label51: if (this.idleState != 0)
          continue;
        return;
      }
      catch (InterruptedException localInterruptedException)
      {
        break label51;
      }
    }
  }

  public static class FetchProfileItem extends FetchProfile.Item
  {
    public static final FetchProfileItem HEADERS = new FetchProfileItem("HEADERS");
    public static final FetchProfileItem SIZE = new FetchProfileItem("SIZE");

    protected FetchProfileItem(String paramString)
    {
      super();
    }
  }

  public static abstract interface ProtocolCommand
  {
    public abstract Object doCommand(IMAPProtocol paramIMAPProtocol)
      throws ProtocolException;
  }
}

/* Location:           D:\jd-gui-0.3.5.windowsÂØπjarÊñá‰ª∂ÂèçÁºñËØë\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.IMAPFolder
 * JD-Core Version:    0.6.2
 */