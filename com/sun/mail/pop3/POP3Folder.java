package com.sun.mail.pop3;

import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.util.Vector;
import javax.mail.Flags;
import javax.mail.Folder;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.MethodNotSupportedException;
import javax.mail.Store;

public class POP3Folder extends Folder
{
  private boolean doneUidl = false;
  private boolean exists = false;
  private Vector message_cache;
  private String name;
  private boolean opened = false;
  private Protocol port;
  private int size;
  private int total;

  POP3Folder(POP3Store paramPOP3Store, String paramString)
  {
    super(paramPOP3Store);
    this.name = paramString;
    if (paramString.equalsIgnoreCase("INBOX"))
      this.exists = true;
  }

  public void appendMessages(Message[] paramArrayOfMessage)
    throws MessagingException
  {
    throw new MethodNotSupportedException("Append not supported");
  }

  void checkClosed()
    throws IllegalStateException
  {
    if (this.opened)
      throw new IllegalStateException("Folder is Open");
  }

  void checkOpen()
    throws IllegalStateException
  {
    if (!this.opened)
      throw new IllegalStateException("Folder is not Open");
  }

  void checkReadable()
    throws IllegalStateException
  {
    if ((!this.opened) || ((this.mode != 1) && (this.mode != 2)))
      throw new IllegalStateException("Folder is not Readable");
  }

  void checkWritable()
    throws IllegalStateException
  {
    if ((!this.opened) || (this.mode != 2))
      throw new IllegalStateException("Folder is not Writable");
  }

  // ERROR //
  public void close(boolean paramBoolean)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 74	com/sun/mail/pop3/POP3Folder:checkOpen	()V
    //   6: aload_0
    //   7: getfield 78	com/sun/mail/pop3/POP3Folder:store	Ljavax/mail/Store;
    //   10: checkcast 80	com/sun/mail/pop3/POP3Store
    //   13: getfield 83	com/sun/mail/pop3/POP3Store:rsetBeforeQuit	Z
    //   16: ifeq +11 -> 27
    //   19: aload_0
    //   20: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   23: invokevirtual 91	com/sun/mail/pop3/Protocol:rset	()Z
    //   26: pop
    //   27: iload_1
    //   28: ifeq +26 -> 54
    //   31: aload_0
    //   32: getfield 63	com/sun/mail/pop3/POP3Folder:mode	I
    //   35: iconst_2
    //   36: if_icmpne +18 -> 54
    //   39: iconst_0
    //   40: istore 5
    //   42: iload 5
    //   44: aload_0
    //   45: getfield 93	com/sun/mail/pop3/POP3Folder:message_cache	Ljava/util/Vector;
    //   48: invokevirtual 98	java/util/Vector:size	()I
    //   51: if_icmplt +45 -> 96
    //   54: aload_0
    //   55: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   58: invokevirtual 101	com/sun/mail/pop3/Protocol:quit	()Z
    //   61: pop
    //   62: aload_0
    //   63: aconst_null
    //   64: putfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   67: aload_0
    //   68: getfield 78	com/sun/mail/pop3/POP3Folder:store	Ljavax/mail/Store;
    //   71: checkcast 80	com/sun/mail/pop3/POP3Store
    //   74: aload_0
    //   75: invokevirtual 105	com/sun/mail/pop3/POP3Store:closePort	(Lcom/sun/mail/pop3/POP3Folder;)V
    //   78: aload_0
    //   79: aconst_null
    //   80: putfield 93	com/sun/mail/pop3/POP3Folder:message_cache	Ljava/util/Vector;
    //   83: aload_0
    //   84: iconst_0
    //   85: putfield 26	com/sun/mail/pop3/POP3Folder:opened	Z
    //   88: aload_0
    //   89: iconst_3
    //   90: invokevirtual 109	com/sun/mail/pop3/POP3Folder:notifyConnectionListeners	(I)V
    //   93: aload_0
    //   94: monitorexit
    //   95: return
    //   96: aload_0
    //   97: getfield 93	com/sun/mail/pop3/POP3Folder:message_cache	Ljava/util/Vector;
    //   100: iload 5
    //   102: invokevirtual 113	java/util/Vector:elementAt	(I)Ljava/lang/Object;
    //   105: checkcast 115	com/sun/mail/pop3/POP3Message
    //   108: astore 7
    //   110: aload 7
    //   112: ifnull +30 -> 142
    //   115: aload 7
    //   117: getstatic 121	javax/mail/Flags$Flag:DELETED	Ljavax/mail/Flags$Flag;
    //   120: invokevirtual 125	com/sun/mail/pop3/POP3Message:isSet	(Ljavax/mail/Flags$Flag;)Z
    //   123: istore 8
    //   125: iload 8
    //   127: ifeq +15 -> 142
    //   130: aload_0
    //   131: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   134: iload 5
    //   136: iconst_1
    //   137: iadd
    //   138: invokevirtual 129	com/sun/mail/pop3/Protocol:dele	(I)Z
    //   141: pop
    //   142: iinc 5 1
    //   145: goto -103 -> 42
    //   148: astore 9
    //   150: new 42	javax/mail/MessagingException
    //   153: dup
    //   154: ldc 131
    //   156: aload 9
    //   158: invokespecial 134	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   161: athrow
    //   162: astore 4
    //   164: aload_0
    //   165: aconst_null
    //   166: putfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   169: aload_0
    //   170: getfield 78	com/sun/mail/pop3/POP3Folder:store	Ljavax/mail/Store;
    //   173: checkcast 80	com/sun/mail/pop3/POP3Store
    //   176: aload_0
    //   177: invokevirtual 105	com/sun/mail/pop3/POP3Store:closePort	(Lcom/sun/mail/pop3/POP3Folder;)V
    //   180: aload_0
    //   181: aconst_null
    //   182: putfield 93	com/sun/mail/pop3/POP3Folder:message_cache	Ljava/util/Vector;
    //   185: aload_0
    //   186: iconst_0
    //   187: putfield 26	com/sun/mail/pop3/POP3Folder:opened	Z
    //   190: aload_0
    //   191: iconst_3
    //   192: invokevirtual 109	com/sun/mail/pop3/POP3Folder:notifyConnectionListeners	(I)V
    //   195: goto -102 -> 93
    //   198: astore_2
    //   199: aload_0
    //   200: monitorexit
    //   201: aload_2
    //   202: athrow
    //   203: astore_3
    //   204: aload_0
    //   205: aconst_null
    //   206: putfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   209: aload_0
    //   210: getfield 78	com/sun/mail/pop3/POP3Folder:store	Ljavax/mail/Store;
    //   213: checkcast 80	com/sun/mail/pop3/POP3Store
    //   216: aload_0
    //   217: invokevirtual 105	com/sun/mail/pop3/POP3Store:closePort	(Lcom/sun/mail/pop3/POP3Folder;)V
    //   220: aload_0
    //   221: aconst_null
    //   222: putfield 93	com/sun/mail/pop3/POP3Folder:message_cache	Ljava/util/Vector;
    //   225: aload_0
    //   226: iconst_0
    //   227: putfield 26	com/sun/mail/pop3/POP3Folder:opened	Z
    //   230: aload_0
    //   231: iconst_3
    //   232: invokevirtual 109	com/sun/mail/pop3/POP3Folder:notifyConnectionListeners	(I)V
    //   235: aload_3
    //   236: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   130	142	148	java/io/IOException
    //   6	27	162	java/io/IOException
    //   31	39	162	java/io/IOException
    //   42	54	162	java/io/IOException
    //   54	62	162	java/io/IOException
    //   96	110	162	java/io/IOException
    //   115	125	162	java/io/IOException
    //   150	162	162	java/io/IOException
    //   2	6	198	finally
    //   62	93	198	finally
    //   164	195	198	finally
    //   204	237	198	finally
    //   6	27	203	finally
    //   31	39	203	finally
    //   42	54	203	finally
    //   54	62	203	finally
    //   96	110	203	finally
    //   115	125	203	finally
    //   130	142	203	finally
    //   150	162	203	finally
  }

  public boolean create(int paramInt)
    throws MessagingException
  {
    return false;
  }

  protected POP3Message createMessage(Folder paramFolder, int paramInt)
    throws MessagingException
  {
    Constructor localConstructor = ((POP3Store)this.store).messageConstructor;
    POP3Message localPOP3Message = null;
    if (localConstructor != null);
    try
    {
      Object[] arrayOfObject = new Object[2];
      arrayOfObject[0] = this;
      arrayOfObject[1] = new Integer(paramInt);
      localPOP3Message = (POP3Message)localConstructor.newInstance(arrayOfObject);
      if (localPOP3Message == null)
        localPOP3Message = new POP3Message(this, paramInt);
      return localPOP3Message;
    }
    catch (Exception localException)
    {
      while (true)
        localPOP3Message = null;
    }
  }

  public boolean delete(boolean paramBoolean)
    throws MessagingException
  {
    throw new MethodNotSupportedException("delete");
  }

  public boolean exists()
  {
    return this.exists;
  }

  public Message[] expunge()
    throws MessagingException
  {
    throw new MethodNotSupportedException("Expunge not supported");
  }

  // ERROR //
  public void fetch(Message[] paramArrayOfMessage, javax.mail.FetchProfile paramFetchProfile)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 173	com/sun/mail/pop3/POP3Folder:checkReadable	()V
    //   6: aload_0
    //   7: getfield 28	com/sun/mail/pop3/POP3Folder:doneUidl	Z
    //   10: ifne +97 -> 107
    //   13: aload_2
    //   14: getstatic 179	javax/mail/UIDFolder$FetchProfileItem:UID	Ljavax/mail/UIDFolder$FetchProfileItem;
    //   17: invokevirtual 185	javax/mail/FetchProfile:contains	(Ljavax/mail/FetchProfile$Item;)Z
    //   20: ifeq +87 -> 107
    //   23: aload_0
    //   24: getfield 93	com/sun/mail/pop3/POP3Folder:message_cache	Ljava/util/Vector;
    //   27: invokevirtual 98	java/util/Vector:size	()I
    //   30: anewarray 34	java/lang/String
    //   33: astore 10
    //   35: aload_0
    //   36: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   39: aload 10
    //   41: invokevirtual 189	com/sun/mail/pop3/Protocol:uidl	([Ljava/lang/String;)Z
    //   44: istore 13
    //   46: iload 13
    //   48: ifne +150 -> 198
    //   51: aload_0
    //   52: monitorexit
    //   53: return
    //   54: astore 12
    //   56: aload_0
    //   57: iconst_0
    //   58: invokevirtual 191	com/sun/mail/pop3/POP3Folder:close	(Z)V
    //   61: new 193	javax/mail/FolderClosedException
    //   64: dup
    //   65: aload_0
    //   66: aload 12
    //   68: invokevirtual 197	java/io/EOFException:toString	()Ljava/lang/String;
    //   71: invokespecial 200	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   74: athrow
    //   75: astore_3
    //   76: aload_0
    //   77: monitorexit
    //   78: aload_3
    //   79: athrow
    //   80: astore 11
    //   82: new 42	javax/mail/MessagingException
    //   85: dup
    //   86: ldc 202
    //   88: aload 11
    //   90: invokespecial 134	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   93: athrow
    //   94: iload 14
    //   96: aload 10
    //   98: arraylength
    //   99: if_icmplt +61 -> 160
    //   102: aload_0
    //   103: iconst_1
    //   104: putfield 28	com/sun/mail/pop3/POP3Folder:doneUidl	Z
    //   107: aload_2
    //   108: getstatic 208	javax/mail/FetchProfile$Item:ENVELOPE	Ljavax/mail/FetchProfile$Item;
    //   111: invokevirtual 185	javax/mail/FetchProfile:contains	(Ljavax/mail/FetchProfile$Item;)Z
    //   114: ifeq -63 -> 51
    //   117: iconst_0
    //   118: istore 4
    //   120: aload_1
    //   121: arraylength
    //   122: istore 5
    //   124: iload 4
    //   126: iload 5
    //   128: if_icmpge -77 -> 51
    //   131: aload_1
    //   132: iload 4
    //   134: aaload
    //   135: checkcast 115	com/sun/mail/pop3/POP3Message
    //   138: astore 7
    //   140: aload 7
    //   142: ldc 210
    //   144: invokevirtual 214	com/sun/mail/pop3/POP3Message:getHeader	(Ljava/lang/String;)[Ljava/lang/String;
    //   147: pop
    //   148: aload 7
    //   150: invokevirtual 217	com/sun/mail/pop3/POP3Message:getSize	()I
    //   153: pop
    //   154: iinc 4 1
    //   157: goto -37 -> 120
    //   160: aload 10
    //   162: iload 14
    //   164: aaload
    //   165: ifnonnull +6 -> 171
    //   168: goto +36 -> 204
    //   171: aload_0
    //   172: iload 14
    //   174: iconst_1
    //   175: iadd
    //   176: invokevirtual 221	com/sun/mail/pop3/POP3Folder:getMessage	(I)Ljavax/mail/Message;
    //   179: checkcast 115	com/sun/mail/pop3/POP3Message
    //   182: aload 10
    //   184: iload 14
    //   186: aaload
    //   187: putfield 224	com/sun/mail/pop3/POP3Message:uid	Ljava/lang/String;
    //   190: goto +14 -> 204
    //   193: astore 6
    //   195: goto -41 -> 154
    //   198: iconst_0
    //   199: istore 14
    //   201: goto -107 -> 94
    //   204: iinc 14 1
    //   207: goto -113 -> 94
    //
    // Exception table:
    //   from	to	target	type
    //   35	46	54	java/io/EOFException
    //   2	35	75	finally
    //   35	46	75	finally
    //   56	75	75	finally
    //   82	94	75	finally
    //   94	107	75	finally
    //   107	117	75	finally
    //   120	124	75	finally
    //   131	154	75	finally
    //   160	168	75	finally
    //   171	190	75	finally
    //   35	46	80	java/io/IOException
    //   131	154	193	javax/mail/MessageRemovedException
  }

  protected void finalize()
    throws Throwable
  {
    super.finalize();
    close(false);
  }

  public Folder getFolder(String paramString)
    throws MessagingException
  {
    throw new MessagingException("not a directory");
  }

  public String getFullName()
  {
    return this.name;
  }

  public Message getMessage(int paramInt)
    throws MessagingException
  {
    try
    {
      checkOpen();
      POP3Message localPOP3Message = (POP3Message)this.message_cache.elementAt(paramInt - 1);
      if (localPOP3Message == null)
      {
        localPOP3Message = createMessage(this, paramInt);
        this.message_cache.setElementAt(localPOP3Message, paramInt - 1);
      }
      return localPOP3Message;
    }
    finally
    {
    }
  }

  public int getMessageCount()
    throws MessagingException
  {
    try
    {
      boolean bool = this.opened;
      if (!bool);
      for (int i = -1; ; i = this.total)
      {
        return i;
        checkReadable();
      }
    }
    finally
    {
    }
  }

  public String getName()
  {
    return this.name;
  }

  public Folder getParent()
  {
    return new DefaultFolder((POP3Store)this.store);
  }

  public Flags getPermanentFlags()
  {
    return new Flags();
  }

  Protocol getProtocol()
    throws MessagingException
  {
    checkOpen();
    return this.port;
  }

  public char getSeparator()
  {
    return '\000';
  }

  public int getSize()
    throws MessagingException
  {
    try
    {
      checkOpen();
      int i = this.size;
      return i;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  // ERROR //
  public int[] getSizes()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 74	com/sun/mail/pop3/POP3Folder:checkOpen	()V
    //   6: aload_0
    //   7: getfield 244	com/sun/mail/pop3/POP3Folder:total	I
    //   10: newarray int
    //   12: astore_2
    //   13: aconst_null
    //   14: astore_3
    //   15: aconst_null
    //   16: astore 4
    //   18: aload_0
    //   19: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   22: invokevirtual 270	com/sun/mail/pop3/Protocol:list	()Ljava/io/InputStream;
    //   25: astore_3
    //   26: new 272	com/sun/mail/util/LineInputStream
    //   29: dup
    //   30: aload_3
    //   31: invokespecial 275	com/sun/mail/util/LineInputStream:<init>	(Ljava/io/InputStream;)V
    //   34: astore 11
    //   36: aload 11
    //   38: invokevirtual 278	com/sun/mail/util/LineInputStream:readLine	()Ljava/lang/String;
    //   41: astore 13
    //   43: aload 13
    //   45: ifnonnull +25 -> 70
    //   48: aload 11
    //   50: ifnull +8 -> 58
    //   53: aload 11
    //   55: invokevirtual 280	com/sun/mail/util/LineInputStream:close	()V
    //   58: aload_3
    //   59: ifnull +171 -> 230
    //   62: aload_3
    //   63: invokevirtual 283	java/io/InputStream:close	()V
    //   66: aload_0
    //   67: monitorexit
    //   68: aload_2
    //   69: areturn
    //   70: new 285	java/util/StringTokenizer
    //   73: dup
    //   74: aload 13
    //   76: invokespecial 286	java/util/StringTokenizer:<init>	(Ljava/lang/String;)V
    //   79: astore 14
    //   81: aload 14
    //   83: invokevirtual 289	java/util/StringTokenizer:nextToken	()Ljava/lang/String;
    //   86: invokestatic 293	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   89: istore 16
    //   91: aload 14
    //   93: invokevirtual 289	java/util/StringTokenizer:nextToken	()Ljava/lang/String;
    //   96: invokestatic 293	java/lang/Integer:parseInt	(Ljava/lang/String;)I
    //   99: istore 17
    //   101: iload 16
    //   103: ifle -67 -> 36
    //   106: iload 16
    //   108: aload_0
    //   109: getfield 244	com/sun/mail/pop3/POP3Folder:total	I
    //   112: if_icmpgt -76 -> 36
    //   115: aload_2
    //   116: iload 16
    //   118: iconst_1
    //   119: isub
    //   120: iload 17
    //   122: iastore
    //   123: goto -87 -> 36
    //   126: astore 15
    //   128: goto -92 -> 36
    //   131: astore 8
    //   133: aload 4
    //   135: ifnull +8 -> 143
    //   138: aload 4
    //   140: invokevirtual 280	com/sun/mail/util/LineInputStream:close	()V
    //   143: aload_3
    //   144: ifnull -78 -> 66
    //   147: aload_3
    //   148: invokevirtual 283	java/io/InputStream:close	()V
    //   151: goto -85 -> 66
    //   154: astore 9
    //   156: goto -90 -> 66
    //   159: astore 5
    //   161: aload 4
    //   163: ifnull +8 -> 171
    //   166: aload 4
    //   168: invokevirtual 280	com/sun/mail/util/LineInputStream:close	()V
    //   171: aload_3
    //   172: ifnull +7 -> 179
    //   175: aload_3
    //   176: invokevirtual 283	java/io/InputStream:close	()V
    //   179: aload 5
    //   181: athrow
    //   182: astore_1
    //   183: aload_0
    //   184: monitorexit
    //   185: aload_1
    //   186: athrow
    //   187: astore 18
    //   189: goto -123 -> 66
    //   192: astore 10
    //   194: goto -51 -> 143
    //   197: astore 7
    //   199: goto -28 -> 171
    //   202: astore 6
    //   204: goto -25 -> 179
    //   207: astore 19
    //   209: goto -151 -> 58
    //   212: astore 5
    //   214: aload 11
    //   216: astore 4
    //   218: goto -57 -> 161
    //   221: astore 12
    //   223: aload 11
    //   225: astore 4
    //   227: goto -94 -> 133
    //   230: goto -164 -> 66
    //
    // Exception table:
    //   from	to	target	type
    //   70	101	126	java/lang/Exception
    //   106	123	126	java/lang/Exception
    //   18	36	131	java/io/IOException
    //   147	151	154	java/io/IOException
    //   18	36	159	finally
    //   2	13	182	finally
    //   53	58	182	finally
    //   62	66	182	finally
    //   138	143	182	finally
    //   147	151	182	finally
    //   166	171	182	finally
    //   175	179	182	finally
    //   179	182	182	finally
    //   62	66	187	java/io/IOException
    //   138	143	192	java/io/IOException
    //   166	171	197	java/io/IOException
    //   175	179	202	java/io/IOException
    //   53	58	207	java/io/IOException
    //   36	43	212	finally
    //   70	101	212	finally
    //   106	123	212	finally
    //   36	43	221	java/io/IOException
    //   70	101	221	java/io/IOException
    //   106	123	221	java/io/IOException
  }

  public int getType()
  {
    return 1;
  }

  // ERROR //
  public String getUID(Message paramMessage)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 74	com/sun/mail/pop3/POP3Folder:checkOpen	()V
    //   6: aload_1
    //   7: checkcast 115	com/sun/mail/pop3/POP3Message
    //   10: astore_3
    //   11: aload_3
    //   12: getfield 224	com/sun/mail/pop3/POP3Message:uid	Ljava/lang/String;
    //   15: ldc_w 298
    //   18: if_acmpne +18 -> 36
    //   21: aload_3
    //   22: aload_0
    //   23: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   26: aload_3
    //   27: invokevirtual 301	com/sun/mail/pop3/POP3Message:getMessageNumber	()I
    //   30: invokevirtual 304	com/sun/mail/pop3/Protocol:uidl	(I)Ljava/lang/String;
    //   33: putfield 224	com/sun/mail/pop3/POP3Message:uid	Ljava/lang/String;
    //   36: aload_3
    //   37: getfield 224	com/sun/mail/pop3/POP3Message:uid	Ljava/lang/String;
    //   40: astore 6
    //   42: aload_0
    //   43: monitorexit
    //   44: aload 6
    //   46: areturn
    //   47: astore 5
    //   49: aload_0
    //   50: iconst_0
    //   51: invokevirtual 191	com/sun/mail/pop3/POP3Folder:close	(Z)V
    //   54: new 193	javax/mail/FolderClosedException
    //   57: dup
    //   58: aload_0
    //   59: aload 5
    //   61: invokevirtual 197	java/io/EOFException:toString	()Ljava/lang/String;
    //   64: invokespecial 200	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   67: athrow
    //   68: astore_2
    //   69: aload_0
    //   70: monitorexit
    //   71: aload_2
    //   72: athrow
    //   73: astore 4
    //   75: new 42	javax/mail/MessagingException
    //   78: dup
    //   79: ldc 202
    //   81: aload 4
    //   83: invokespecial 134	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   86: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   11	36	47	java/io/EOFException
    //   36	42	47	java/io/EOFException
    //   2	11	68	finally
    //   11	36	68	finally
    //   36	42	68	finally
    //   49	68	68	finally
    //   75	87	68	finally
    //   11	36	73	java/io/IOException
    //   36	42	73	java/io/IOException
  }

  public boolean hasNewMessages()
    throws MessagingException
  {
    return false;
  }

  public boolean isOpen()
  {
    if (!this.opened)
      return false;
    if (this.store.isConnected())
      return true;
    try
    {
      close(false);
      return false;
    }
    catch (MessagingException localMessagingException)
    {
    }
    return false;
  }

  public Folder[] list(String paramString)
    throws MessagingException
  {
    throw new MessagingException("not a directory");
  }

  public InputStream listCommand()
    throws MessagingException, IOException
  {
    try
    {
      checkOpen();
      InputStream localInputStream = this.port.list();
      return localInputStream;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected void notifyMessageChangedListeners(int paramInt, Message paramMessage)
  {
    super.notifyMessageChangedListeners(paramInt, paramMessage);
  }

  // ERROR //
  public void open(int paramInt)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 320	com/sun/mail/pop3/POP3Folder:checkClosed	()V
    //   6: aload_0
    //   7: getfield 24	com/sun/mail/pop3/POP3Folder:exists	Z
    //   10: ifne +20 -> 30
    //   13: new 322	javax/mail/FolderNotFoundException
    //   16: dup
    //   17: aload_0
    //   18: ldc_w 324
    //   21: invokespecial 325	javax/mail/FolderNotFoundException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   24: athrow
    //   25: astore_2
    //   26: aload_0
    //   27: monitorexit
    //   28: aload_2
    //   29: athrow
    //   30: aload_0
    //   31: aload_0
    //   32: getfield 78	com/sun/mail/pop3/POP3Folder:store	Ljavax/mail/Store;
    //   35: checkcast 80	com/sun/mail/pop3/POP3Store
    //   38: aload_0
    //   39: invokevirtual 329	com/sun/mail/pop3/POP3Store:getPort	(Lcom/sun/mail/pop3/POP3Folder;)Lcom/sun/mail/pop3/Protocol;
    //   42: putfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   45: aload_0
    //   46: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   49: invokevirtual 333	com/sun/mail/pop3/Protocol:stat	()Lcom/sun/mail/pop3/Status;
    //   52: astore 7
    //   54: aload_0
    //   55: aload 7
    //   57: getfield 336	com/sun/mail/pop3/Status:total	I
    //   60: putfield 244	com/sun/mail/pop3/POP3Folder:total	I
    //   63: aload_0
    //   64: aload 7
    //   66: getfield 337	com/sun/mail/pop3/Status:size	I
    //   69: putfield 264	com/sun/mail/pop3/POP3Folder:size	I
    //   72: aload_0
    //   73: iload_1
    //   74: putfield 63	com/sun/mail/pop3/POP3Folder:mode	I
    //   77: aload_0
    //   78: iconst_1
    //   79: putfield 26	com/sun/mail/pop3/POP3Folder:opened	Z
    //   82: aload_0
    //   83: new 95	java/util/Vector
    //   86: dup
    //   87: aload_0
    //   88: getfield 244	com/sun/mail/pop3/POP3Folder:total	I
    //   91: invokespecial 338	java/util/Vector:<init>	(I)V
    //   94: putfield 93	com/sun/mail/pop3/POP3Folder:message_cache	Ljava/util/Vector;
    //   97: aload_0
    //   98: getfield 93	com/sun/mail/pop3/POP3Folder:message_cache	Ljava/util/Vector;
    //   101: aload_0
    //   102: getfield 244	com/sun/mail/pop3/POP3Folder:total	I
    //   105: invokevirtual 341	java/util/Vector:setSize	(I)V
    //   108: aload_0
    //   109: iconst_0
    //   110: putfield 28	com/sun/mail/pop3/POP3Folder:doneUidl	Z
    //   113: aload_0
    //   114: iconst_1
    //   115: invokevirtual 109	com/sun/mail/pop3/POP3Folder:notifyConnectionListeners	(I)V
    //   118: aload_0
    //   119: monitorexit
    //   120: return
    //   121: astore_3
    //   122: aload_0
    //   123: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   126: ifnull +11 -> 137
    //   129: aload_0
    //   130: getfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   133: invokevirtual 101	com/sun/mail/pop3/Protocol:quit	()Z
    //   136: pop
    //   137: aload_0
    //   138: aconst_null
    //   139: putfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   142: aload_0
    //   143: getfield 78	com/sun/mail/pop3/POP3Folder:store	Ljavax/mail/Store;
    //   146: checkcast 80	com/sun/mail/pop3/POP3Store
    //   149: aload_0
    //   150: invokevirtual 105	com/sun/mail/pop3/POP3Store:closePort	(Lcom/sun/mail/pop3/POP3Folder;)V
    //   153: new 42	javax/mail/MessagingException
    //   156: dup
    //   157: ldc_w 343
    //   160: aload_3
    //   161: invokespecial 134	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   164: athrow
    //   165: astore 5
    //   167: aload_0
    //   168: aconst_null
    //   169: putfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   172: aload_0
    //   173: getfield 78	com/sun/mail/pop3/POP3Folder:store	Ljavax/mail/Store;
    //   176: checkcast 80	com/sun/mail/pop3/POP3Store
    //   179: aload_0
    //   180: invokevirtual 105	com/sun/mail/pop3/POP3Store:closePort	(Lcom/sun/mail/pop3/POP3Folder;)V
    //   183: goto -30 -> 153
    //   186: astore 4
    //   188: aload_0
    //   189: aconst_null
    //   190: putfield 85	com/sun/mail/pop3/POP3Folder:port	Lcom/sun/mail/pop3/Protocol;
    //   193: aload_0
    //   194: getfield 78	com/sun/mail/pop3/POP3Folder:store	Ljavax/mail/Store;
    //   197: checkcast 80	com/sun/mail/pop3/POP3Store
    //   200: aload_0
    //   201: invokevirtual 105	com/sun/mail/pop3/POP3Store:closePort	(Lcom/sun/mail/pop3/POP3Folder;)V
    //   204: aload 4
    //   206: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   2	25	25	finally
    //   30	82	25	finally
    //   82	118	25	finally
    //   137	153	25	finally
    //   153	165	25	finally
    //   167	183	25	finally
    //   188	207	25	finally
    //   30	82	121	java/io/IOException
    //   122	137	165	java/io/IOException
    //   122	137	186	finally
  }

  public boolean renameTo(Folder paramFolder)
    throws MessagingException
  {
    throw new MethodNotSupportedException("renameTo");
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.pop3.POP3Folder
 * JD-Core Version:    0.6.2
 */