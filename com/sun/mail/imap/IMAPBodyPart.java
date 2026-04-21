package com.sun.mail.imap;

import com.sun.mail.iap.ConnectionException;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.imap.protocol.BODY;
import com.sun.mail.imap.protocol.BODYSTRUCTURE;
import com.sun.mail.imap.protocol.IMAPProtocol;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.Enumeration;
import javax.activation.DataHandler;
import javax.mail.FolderClosedException;
import javax.mail.IllegalWriteException;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.internet.ContentType;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeUtility;
import javax.mail.internet.ParameterList;

public class IMAPBodyPart extends MimeBodyPart
{
  private BODYSTRUCTURE bs;
  private String description;
  private boolean headersLoaded = false;
  private IMAPMessage message;
  private String sectionId;
  private String type;

  protected IMAPBodyPart(BODYSTRUCTURE paramBODYSTRUCTURE, String paramString, IMAPMessage paramIMAPMessage)
  {
    this.bs = paramBODYSTRUCTURE;
    this.sectionId = paramString;
    this.message = paramIMAPMessage;
    this.type = new ContentType(paramBODYSTRUCTURE.type, paramBODYSTRUCTURE.subtype, paramBODYSTRUCTURE.cParams).toString();
  }

  // ERROR //
  private void loadHeaders()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 21	com/sun/mail/imap/IMAPBodyPart:headersLoaded	Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifeq +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: aload_0
    //   15: getfield 59	com/sun/mail/imap/IMAPBodyPart:headers	Ljavax/mail/internet/InternetHeaders;
    //   18: ifnonnull +14 -> 32
    //   21: aload_0
    //   22: new 61	javax/mail/internet/InternetHeaders
    //   25: dup
    //   26: invokespecial 62	javax/mail/internet/InternetHeaders:<init>	()V
    //   29: putfield 59	com/sun/mail/imap/IMAPBodyPart:headers	Ljavax/mail/internet/InternetHeaders;
    //   32: aload_0
    //   33: getfield 27	com/sun/mail/imap/IMAPBodyPart:message	Lcom/sun/mail/imap/IMAPMessage;
    //   36: invokevirtual 68	com/sun/mail/imap/IMAPMessage:getMessageCacheLock	()Ljava/lang/Object;
    //   39: astore_3
    //   40: aload_3
    //   41: monitorenter
    //   42: aload_0
    //   43: getfield 27	com/sun/mail/imap/IMAPBodyPart:message	Lcom/sun/mail/imap/IMAPMessage;
    //   46: invokevirtual 72	com/sun/mail/imap/IMAPMessage:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   49: astore 7
    //   51: aload_0
    //   52: getfield 27	com/sun/mail/imap/IMAPBodyPart:message	Lcom/sun/mail/imap/IMAPMessage;
    //   55: invokevirtual 75	com/sun/mail/imap/IMAPMessage:checkExpunged	()V
    //   58: aload 7
    //   60: invokevirtual 81	com/sun/mail/imap/protocol/IMAPProtocol:isREV1	()Z
    //   63: ifeq +146 -> 209
    //   66: aload 7
    //   68: aload_0
    //   69: getfield 27	com/sun/mail/imap/IMAPBodyPart:message	Lcom/sun/mail/imap/IMAPMessage;
    //   72: invokevirtual 85	com/sun/mail/imap/IMAPMessage:getSequenceNumber	()I
    //   75: new 87	java/lang/StringBuilder
    //   78: dup
    //   79: aload_0
    //   80: getfield 25	com/sun/mail/imap/IMAPBodyPart:sectionId	Ljava/lang/String;
    //   83: invokestatic 93	java/lang/String:valueOf	(Ljava/lang/Object;)Ljava/lang/String;
    //   86: invokespecial 96	java/lang/StringBuilder:<init>	(Ljava/lang/String;)V
    //   89: ldc 98
    //   91: invokevirtual 102	java/lang/StringBuilder:append	(Ljava/lang/String;)Ljava/lang/StringBuilder;
    //   94: invokevirtual 103	java/lang/StringBuilder:toString	()Ljava/lang/String;
    //   97: invokevirtual 107	com/sun/mail/imap/protocol/IMAPProtocol:peekBody	(ILjava/lang/String;)Lcom/sun/mail/imap/protocol/BODY;
    //   100: astore 8
    //   102: aload 8
    //   104: ifnonnull +47 -> 151
    //   107: new 51	javax/mail/MessagingException
    //   110: dup
    //   111: ldc 109
    //   113: invokespecial 110	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   116: athrow
    //   117: astore 6
    //   119: new 112	javax/mail/FolderClosedException
    //   122: dup
    //   123: aload_0
    //   124: getfield 27	com/sun/mail/imap/IMAPBodyPart:message	Lcom/sun/mail/imap/IMAPMessage;
    //   127: invokevirtual 116	com/sun/mail/imap/IMAPMessage:getFolder	()Ljavax/mail/Folder;
    //   130: aload 6
    //   132: invokevirtual 119	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   135: invokespecial 122	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   138: athrow
    //   139: astore 5
    //   141: aload_3
    //   142: monitorexit
    //   143: aload 5
    //   145: athrow
    //   146: astore_1
    //   147: aload_0
    //   148: monitorexit
    //   149: aload_1
    //   150: athrow
    //   151: aload 8
    //   153: invokevirtual 128	com/sun/mail/imap/protocol/BODY:getByteArrayInputStream	()Ljava/io/ByteArrayInputStream;
    //   156: astore 9
    //   158: aload 9
    //   160: ifnonnull +30 -> 190
    //   163: new 51	javax/mail/MessagingException
    //   166: dup
    //   167: ldc 109
    //   169: invokespecial 110	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   172: athrow
    //   173: astore 4
    //   175: new 51	javax/mail/MessagingException
    //   178: dup
    //   179: aload 4
    //   181: invokevirtual 129	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   184: aload 4
    //   186: invokespecial 132	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   189: athrow
    //   190: aload_0
    //   191: getfield 59	com/sun/mail/imap/IMAPBodyPart:headers	Ljavax/mail/internet/InternetHeaders;
    //   194: aload 9
    //   196: invokevirtual 136	javax/mail/internet/InternetHeaders:load	(Ljava/io/InputStream;)V
    //   199: aload_3
    //   200: monitorexit
    //   201: aload_0
    //   202: iconst_1
    //   203: putfield 21	com/sun/mail/imap/IMAPBodyPart:headersLoaded	Z
    //   206: goto -195 -> 11
    //   209: aload_0
    //   210: getfield 59	com/sun/mail/imap/IMAPBodyPart:headers	Ljavax/mail/internet/InternetHeaders;
    //   213: ldc 138
    //   215: aload_0
    //   216: getfield 48	com/sun/mail/imap/IMAPBodyPart:type	Ljava/lang/String;
    //   219: invokevirtual 142	javax/mail/internet/InternetHeaders:addHeader	(Ljava/lang/String;Ljava/lang/String;)V
    //   222: aload_0
    //   223: getfield 59	com/sun/mail/imap/IMAPBodyPart:headers	Ljavax/mail/internet/InternetHeaders;
    //   226: ldc 144
    //   228: aload_0
    //   229: getfield 23	com/sun/mail/imap/IMAPBodyPart:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   232: getfield 147	com/sun/mail/imap/protocol/BODYSTRUCTURE:encoding	Ljava/lang/String;
    //   235: invokevirtual 142	javax/mail/internet/InternetHeaders:addHeader	(Ljava/lang/String;Ljava/lang/String;)V
    //   238: aload_0
    //   239: getfield 23	com/sun/mail/imap/IMAPBodyPart:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   242: getfield 149	com/sun/mail/imap/protocol/BODYSTRUCTURE:description	Ljava/lang/String;
    //   245: ifnull +19 -> 264
    //   248: aload_0
    //   249: getfield 59	com/sun/mail/imap/IMAPBodyPart:headers	Ljavax/mail/internet/InternetHeaders;
    //   252: ldc 151
    //   254: aload_0
    //   255: getfield 23	com/sun/mail/imap/IMAPBodyPart:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   258: getfield 149	com/sun/mail/imap/protocol/BODYSTRUCTURE:description	Ljava/lang/String;
    //   261: invokevirtual 142	javax/mail/internet/InternetHeaders:addHeader	(Ljava/lang/String;Ljava/lang/String;)V
    //   264: aload_0
    //   265: getfield 23	com/sun/mail/imap/IMAPBodyPart:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   268: getfield 154	com/sun/mail/imap/protocol/BODYSTRUCTURE:id	Ljava/lang/String;
    //   271: ifnull +19 -> 290
    //   274: aload_0
    //   275: getfield 59	com/sun/mail/imap/IMAPBodyPart:headers	Ljavax/mail/internet/InternetHeaders;
    //   278: ldc 156
    //   280: aload_0
    //   281: getfield 23	com/sun/mail/imap/IMAPBodyPart:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   284: getfield 154	com/sun/mail/imap/protocol/BODYSTRUCTURE:id	Ljava/lang/String;
    //   287: invokevirtual 142	javax/mail/internet/InternetHeaders:addHeader	(Ljava/lang/String;Ljava/lang/String;)V
    //   290: aload_0
    //   291: getfield 23	com/sun/mail/imap/IMAPBodyPart:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   294: getfield 159	com/sun/mail/imap/protocol/BODYSTRUCTURE:md5	Ljava/lang/String;
    //   297: ifnull -98 -> 199
    //   300: aload_0
    //   301: getfield 59	com/sun/mail/imap/IMAPBodyPart:headers	Ljavax/mail/internet/InternetHeaders;
    //   304: ldc 161
    //   306: aload_0
    //   307: getfield 23	com/sun/mail/imap/IMAPBodyPart:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   310: getfield 159	com/sun/mail/imap/protocol/BODYSTRUCTURE:md5	Ljava/lang/String;
    //   313: invokevirtual 142	javax/mail/internet/InternetHeaders:addHeader	(Ljava/lang/String;Ljava/lang/String;)V
    //   316: goto -117 -> 199
    //
    // Exception table:
    //   from	to	target	type
    //   42	102	117	com/sun/mail/iap/ConnectionException
    //   107	117	117	com/sun/mail/iap/ConnectionException
    //   151	158	117	com/sun/mail/iap/ConnectionException
    //   163	173	117	com/sun/mail/iap/ConnectionException
    //   190	199	117	com/sun/mail/iap/ConnectionException
    //   209	264	117	com/sun/mail/iap/ConnectionException
    //   264	290	117	com/sun/mail/iap/ConnectionException
    //   290	316	117	com/sun/mail/iap/ConnectionException
    //   42	102	139	finally
    //   107	117	139	finally
    //   119	139	139	finally
    //   141	143	139	finally
    //   151	158	139	finally
    //   163	173	139	finally
    //   175	190	139	finally
    //   190	199	139	finally
    //   199	201	139	finally
    //   209	264	139	finally
    //   264	290	139	finally
    //   290	316	139	finally
    //   2	7	146	finally
    //   14	32	146	finally
    //   32	42	146	finally
    //   143	146	146	finally
    //   201	206	146	finally
    //   42	102	173	com/sun/mail/iap/ProtocolException
    //   107	117	173	com/sun/mail/iap/ProtocolException
    //   151	158	173	com/sun/mail/iap/ProtocolException
    //   163	173	173	com/sun/mail/iap/ProtocolException
    //   190	199	173	com/sun/mail/iap/ProtocolException
    //   209	264	173	com/sun/mail/iap/ProtocolException
    //   264	290	173	com/sun/mail/iap/ProtocolException
    //   290	316	173	com/sun/mail/iap/ProtocolException
  }

  public void addHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void addHeaderLine(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public Enumeration getAllHeaderLines()
    throws MessagingException
  {
    loadHeaders();
    return super.getAllHeaderLines();
  }

  public Enumeration getAllHeaders()
    throws MessagingException
  {
    loadHeaders();
    return super.getAllHeaders();
  }

  public String getContentID()
    throws MessagingException
  {
    return this.bs.id;
  }

  public String getContentMD5()
    throws MessagingException
  {
    return this.bs.md5;
  }

  protected InputStream getContentStream()
    throws MessagingException
  {
    boolean bool = this.message.getPeek();
    Object localObject4;
    try
    {
      synchronized (this.message.getMessageCacheLock())
      {
        try
        {
          IMAPProtocol localIMAPProtocol = this.message.getProtocol();
          this.message.checkExpunged();
          if ((localIMAPProtocol.isREV1()) && (this.message.getFetchBlockSize() != -1))
          {
            IMAPInputStream localIMAPInputStream = new IMAPInputStream(this.message, this.sectionId, this.bs.size, bool);
            return localIMAPInputStream;
          }
          int i = this.message.getSequenceNumber();
          if (bool);
          BODY localBODY;
          for (Object localObject3 = localIMAPProtocol.peekBody(i, this.sectionId); ; localObject3 = localBODY)
          {
            localObject4 = null;
            if (localObject3 != null)
            {
              ByteArrayInputStream localByteArrayInputStream = ((BODY)localObject3).getByteArrayInputStream();
              localObject4 = localByteArrayInputStream;
            }
            if (localObject4 != null)
              break;
            throw new MessagingException("No content");
            localBODY = localIMAPProtocol.fetchBody(i, this.sectionId);
          }
        }
        catch (ConnectionException localConnectionException)
        {
          throw new FolderClosedException(this.message.getFolder(), localConnectionException.getMessage());
        }
      }
    }
    catch (ProtocolException localProtocolException)
    {
      throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
    }
    return localObject4;
  }

  public String getContentType()
    throws MessagingException
  {
    return this.type;
  }

  public DataHandler getDataHandler()
    throws MessagingException
  {
    try
    {
      if (this.dh == null)
        if (!this.bs.isMulti())
          break label62;
      for (this.dh = new DataHandler(new IMAPMultipartDataSource(this, this.bs.bodies, this.sectionId, this.message)); ; this.dh = new DataHandler(new IMAPNestedMessage(this.message, this.bs.bodies[0], this.bs.envelope, this.sectionId), this.type))
        label62: 
        do
        {
          DataHandler localDataHandler = super.getDataHandler();
          return localDataHandler;
        }
        while ((!this.bs.isNested()) || (!this.message.isREV1()));
    }
    finally
    {
    }
  }

  public String getDescription()
    throws MessagingException
  {
    if (this.description != null)
      return this.description;
    if (this.bs.description == null)
      return null;
    try
    {
      this.description = MimeUtility.decodeText(this.bs.description);
      return this.description;
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
      while (true)
        this.description = this.bs.description;
    }
  }

  public String getDisposition()
    throws MessagingException
  {
    return this.bs.disposition;
  }

  public String getEncoding()
    throws MessagingException
  {
    return this.bs.encoding;
  }

  public String getFileName()
    throws MessagingException
  {
    ParameterList localParameterList = this.bs.dParams;
    String str = null;
    if (localParameterList != null)
      str = this.bs.dParams.get("filename");
    if ((str == null) && (this.bs.cParams != null))
      str = this.bs.cParams.get("name");
    return str;
  }

  public String[] getHeader(String paramString)
    throws MessagingException
  {
    loadHeaders();
    return super.getHeader(paramString);
  }

  public int getLineCount()
    throws MessagingException
  {
    return this.bs.lines;
  }

  public Enumeration getMatchingHeaderLines(String[] paramArrayOfString)
    throws MessagingException
  {
    loadHeaders();
    return super.getMatchingHeaderLines(paramArrayOfString);
  }

  public Enumeration getMatchingHeaders(String[] paramArrayOfString)
    throws MessagingException
  {
    loadHeaders();
    return super.getMatchingHeaders(paramArrayOfString);
  }

  public Enumeration getNonMatchingHeaderLines(String[] paramArrayOfString)
    throws MessagingException
  {
    loadHeaders();
    return super.getNonMatchingHeaderLines(paramArrayOfString);
  }

  public Enumeration getNonMatchingHeaders(String[] paramArrayOfString)
    throws MessagingException
  {
    loadHeaders();
    return super.getNonMatchingHeaders(paramArrayOfString);
  }

  public int getSize()
    throws MessagingException
  {
    return this.bs.size;
  }

  public void removeHeader(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void setContent(Object paramObject, String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void setContent(Multipart paramMultipart)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void setContentMD5(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void setDataHandler(DataHandler paramDataHandler)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void setDescription(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void setDisposition(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void setFileName(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  public void setHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPBodyPart is read-only");
  }

  protected void updateHeaders()
  {
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.IMAPBodyPart
 * JD-Core Version:    0.6.2
 */