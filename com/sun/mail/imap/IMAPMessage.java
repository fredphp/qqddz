package com.sun.mail.imap;

import com.sun.mail.iap.CommandFailedException;
import com.sun.mail.iap.ConnectionException;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.iap.Response;
import com.sun.mail.imap.protocol.BODY;
import com.sun.mail.imap.protocol.BODYSTRUCTURE;
import com.sun.mail.imap.protocol.ENVELOPE;
import com.sun.mail.imap.protocol.FetchResponse;
import com.sun.mail.imap.protocol.IMAPProtocol;
import com.sun.mail.imap.protocol.INTERNALDATE;
import com.sun.mail.imap.protocol.Item;
import com.sun.mail.imap.protocol.MessageSet;
import com.sun.mail.imap.protocol.RFC822DATA;
import com.sun.mail.imap.protocol.RFC822SIZE;
import com.sun.mail.imap.protocol.UID;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Enumeration;
import java.util.Hashtable;
import java.util.Locale;
import java.util.Vector;
import javax.activation.DataHandler;
import javax.mail.Address;
import javax.mail.FetchProfile;
import javax.mail.FetchProfile.Item;
import javax.mail.Flags;
import javax.mail.Flags.Flag;
import javax.mail.Folder;
import javax.mail.FolderClosedException;
import javax.mail.Header;
import javax.mail.IllegalWriteException;
import javax.mail.Message;
import javax.mail.Message.RecipientType;
import javax.mail.MessageRemovedException;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.UIDFolder.FetchProfileItem;
import javax.mail.internet.ContentType;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.InternetHeaders;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeUtility;
import javax.mail.internet.ParameterList;

public class IMAPMessage extends MimeMessage
{
  private static String EnvelopeCmd = "ENVELOPE INTERNALDATE RFC822.SIZE";
  protected BODYSTRUCTURE bs;
  private String description;
  protected ENVELOPE envelope;
  private boolean headersLoaded = false;
  private Hashtable loadedHeaders;
  private boolean peek;
  private Date receivedDate;
  protected String sectionId;
  private int seqnum;
  private int size = -1;
  private String subject;
  private String type;
  private long uid = -1L;

  protected IMAPMessage(IMAPFolder paramIMAPFolder, int paramInt1, int paramInt2)
  {
    super(paramIMAPFolder, paramInt1);
    this.seqnum = paramInt2;
    this.flags = null;
  }

  protected IMAPMessage(Session paramSession)
  {
    super(paramSession);
  }

  private BODYSTRUCTURE _getBodyStructure()
  {
    return this.bs;
  }

  private ENVELOPE _getEnvelope()
  {
    return this.envelope;
  }

  private Flags _getFlags()
  {
    return this.flags;
  }

  private InternetAddress[] aaclone(InternetAddress[] paramArrayOfInternetAddress)
  {
    if (paramArrayOfInternetAddress == null)
      return null;
    return (InternetAddress[])paramArrayOfInternetAddress.clone();
  }

  private boolean areHeadersLoaded()
  {
    try
    {
      boolean bool = this.headersLoaded;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  private static String craftHeaderCmd(IMAPProtocol paramIMAPProtocol, String[] paramArrayOfString)
  {
    StringBuffer localStringBuffer;
    int i;
    if (paramIMAPProtocol.isREV1())
    {
      localStringBuffer = new StringBuffer("BODY.PEEK[HEADER.FIELDS (");
      i = 0;
      label19: if (i < paramArrayOfString.length)
        break label57;
      if (!paramIMAPProtocol.isREV1())
        break label82;
      localStringBuffer.append(")]");
    }
    while (true)
    {
      return localStringBuffer.toString();
      localStringBuffer = new StringBuffer("RFC822.HEADER.LINES (");
      break;
      label57: if (i > 0)
        localStringBuffer.append(" ");
      localStringBuffer.append(paramArrayOfString[i]);
      i++;
      break label19;
      label82: localStringBuffer.append(")");
    }
  }

  static void fetch(IMAPFolder paramIMAPFolder, Message[] paramArrayOfMessage, FetchProfile paramFetchProfile)
    throws MessagingException
  {
    StringBuffer localStringBuffer = new StringBuffer();
    int i = 1;
    if (paramFetchProfile.contains(FetchProfile.Item.ENVELOPE))
    {
      localStringBuffer.append(EnvelopeCmd);
      i = 0;
    }
    String str6;
    if (paramFetchProfile.contains(FetchProfile.Item.FLAGS))
    {
      if (i == 0)
        break label282;
      str6 = "FLAGS";
    }
    label80: label109: int j;
    label158: label187: String[] arrayOfString;
    MessageSet[] arrayOfMessageSet;
    label282: label296: label303: label310: label336: Object localObject3;
    Vector localVector;
    while (true)
    {
      localStringBuffer.append(str6);
      i = 0;
      String str5;
      String str4;
      String str3;
      String str1;
      Utility.Condition local1FetchProfileCondition;
      if (paramFetchProfile.contains(FetchProfile.Item.CONTENT_INFO))
      {
        if (i != 0)
        {
          str5 = "BODYSTRUCTURE";
          localStringBuffer.append(str5);
          i = 0;
        }
      }
      else
      {
        if (paramFetchProfile.contains(UIDFolder.FetchProfileItem.UID))
        {
          if (i == 0)
            break label296;
          str4 = "UID";
          localStringBuffer.append(str4);
          i = 0;
        }
        boolean bool = paramFetchProfile.contains(IMAPFolder.FetchProfileItem.HEADERS);
        j = 0;
        if (bool)
        {
          j = 1;
          if (!paramIMAPFolder.protocol.isREV1())
            break label310;
          if (i == 0)
            break label303;
          str3 = "BODY.PEEK[HEADER]";
          localStringBuffer.append(str3);
          i = 0;
        }
        if (paramFetchProfile.contains(IMAPFolder.FetchProfileItem.SIZE))
        {
          if (i == 0)
            break label336;
          str1 = "RFC822.SIZE";
          localStringBuffer.append(str1);
          i = 0;
        }
        arrayOfString = (String[])null;
        if (j == 0)
        {
          arrayOfString = paramFetchProfile.getHeaderNames();
          if (arrayOfString.length > 0)
          {
            if (i == 0)
              localStringBuffer.append(" ");
            localStringBuffer.append(craftHeaderCmd(paramIMAPFolder.protocol, arrayOfString));
          }
        }
        local1FetchProfileCondition = new Utility.Condition()
        {
          private String[] hdrs = null;
          private boolean needBodyStructure = false;
          private boolean needEnvelope = false;
          private boolean needFlags = false;
          private boolean needHeaders = false;
          private boolean needSize = false;
          private boolean needUID = false;

          public boolean test(IMAPMessage paramAnonymousIMAPMessage)
          {
            if ((this.needEnvelope) && (paramAnonymousIMAPMessage._getEnvelope() == null));
            while (((this.needFlags) && (paramAnonymousIMAPMessage._getFlags() == null)) || ((this.needBodyStructure) && (paramAnonymousIMAPMessage._getBodyStructure() == null)) || ((this.needUID) && (paramAnonymousIMAPMessage.getUID() == -1L)) || ((this.needHeaders) && (!paramAnonymousIMAPMessage.areHeadersLoaded())) || ((this.needSize) && (paramAnonymousIMAPMessage.size == -1)))
              return true;
            for (int i = 0; ; i++)
            {
              if (i >= this.hdrs.length)
                return false;
              if (!paramAnonymousIMAPMessage.isHeaderLoaded(this.hdrs[i]))
                break;
            }
          }
        };
      }
      synchronized (paramIMAPFolder.messageCacheLock)
      {
        arrayOfMessageSet = Utility.toMessageSet(paramArrayOfMessage, local1FetchProfileCondition);
        if (arrayOfMessageSet == null)
        {
          return;
          str6 = " FLAGS";
          continue;
          str5 = " BODYSTRUCTURE";
          break label80;
          str4 = " UID";
          break label109;
          str3 = " BODY.PEEK[HEADER]";
          break label158;
          if (i != 0);
          for (String str2 = "RFC822.HEADER"; ; str2 = " RFC822.HEADER")
          {
            localStringBuffer.append(str2);
            break;
          }
          str1 = " RFC822.SIZE";
          break label187;
        }
        else
        {
          localObject3 = (Response[])null;
          localVector = new Vector();
        }
      }
    }
    try
    {
      Response[] arrayOfResponse2 = paramIMAPFolder.protocol.fetch(arrayOfMessageSet, localStringBuffer.toString());
      localObject3 = arrayOfResponse2;
      if (localObject3 == null)
      {
        return;
        localObject2 = finally;
        throw localObject2;
      }
    }
    catch (ConnectionException localConnectionException)
    {
      FolderClosedException localFolderClosedException = new FolderClosedException(paramIMAPFolder, localConnectionException.getMessage());
      throw localFolderClosedException;
    }
    catch (ProtocolException localProtocolException)
    {
      MessagingException localMessagingException = new MessagingException(localProtocolException.getMessage(), localProtocolException);
      throw localMessagingException;
      if (k >= localObject3.length)
      {
        int i4 = localVector.size();
        if (i4 != 0)
        {
          Response[] arrayOfResponse1 = new Response[i4];
          localVector.copyInto(arrayOfResponse1);
          paramIMAPFolder.handleResponses(arrayOfResponse1);
        }
        return;
      }
      if (localObject3[k] != null)
        if (!(localObject3[k] instanceof FetchResponse))
        {
          localVector.addElement(localObject3[k]);
        }
        else
        {
          FetchResponse localFetchResponse = (FetchResponse)localObject3[k];
          IMAPMessage localIMAPMessage = paramIMAPFolder.getMessageBySeqNumber(localFetchResponse.getNumber());
          int m = localFetchResponse.getItemCount();
          n = 0;
          i1 = 0;
          if (i1 >= m)
          {
            if (n != 0)
              localVector.addElement(localFetchResponse);
          }
          else
          {
            Item localItem = localFetchResponse.getItem(i1);
            if ((localItem instanceof Flags))
            {
              if ((!paramFetchProfile.contains(FetchProfile.Item.FLAGS)) || (localIMAPMessage == null))
                break label981;
              localIMAPMessage.flags = ((Flags)localItem);
              break label984;
            }
            if ((localItem instanceof ENVELOPE))
            {
              localIMAPMessage.envelope = ((ENVELOPE)localItem);
              break label984;
            }
            if ((localItem instanceof INTERNALDATE))
            {
              localIMAPMessage.receivedDate = ((INTERNALDATE)localItem).getDate();
              break label984;
            }
            if ((localItem instanceof RFC822SIZE))
            {
              localIMAPMessage.size = ((RFC822SIZE)localItem).size;
              break label984;
            }
            if ((localItem instanceof BODYSTRUCTURE))
            {
              localIMAPMessage.bs = ((BODYSTRUCTURE)localItem);
              break label984;
            }
            if ((localItem instanceof UID))
            {
              UID localUID = (UID)localItem;
              localIMAPMessage.uid = localUID.uid;
              if (paramIMAPFolder.uidTable == null)
                paramIMAPFolder.uidTable = new Hashtable();
              paramIMAPFolder.uidTable.put(new Long(localUID.uid), localIMAPMessage);
              break label984;
            }
            if ((!(localItem instanceof RFC822DATA)) && (!(localItem instanceof BODY)))
              break label984;
            ByteArrayInputStream localByteArrayInputStream;
            InternetHeaders localInternetHeaders;
            if ((localItem instanceof RFC822DATA))
            {
              localByteArrayInputStream = ((RFC822DATA)localItem).getByteArrayInputStream();
              localInternetHeaders = new InternetHeaders();
              localInternetHeaders.load(localByteArrayInputStream);
              if ((localIMAPMessage.headers != null) && (j == 0))
                break label873;
              localIMAPMessage.headers = localInternetHeaders;
            }
            while (true)
            {
              if (j == 0)
                break label990;
              localIMAPMessage.setHeadersLoaded(true);
              break label984;
              localByteArrayInputStream = ((BODY)localItem).getByteArrayInputStream();
              break;
              Enumeration localEnumeration = localInternetHeaders.getAllHeaders();
              while (localEnumeration.hasMoreElements())
              {
                Header localHeader = (Header)localEnumeration.nextElement();
                if (!localIMAPMessage.isHeaderLoaded(localHeader.getName()))
                  localIMAPMessage.headers.addHeader(localHeader.getName(), localHeader.getValue());
              }
            }
            while (true)
            {
              int i3 = arrayOfString.length;
              if (i2 >= i3)
                break;
              localIMAPMessage.setHeaderLoaded(arrayOfString[i2]);
              i2++;
            }
          }
        }
    }
    catch (CommandFailedException localCommandFailedException)
    {
      while (true)
      {
        int i1;
        label873: continue;
        int k = 0;
        continue;
        k++;
        continue;
        label981: int n = 1;
        label984: i1++;
        continue;
        label990: int i2 = 0;
      }
    }
  }

  private boolean isHeaderLoaded(String paramString)
  {
    try
    {
      boolean bool1 = this.headersLoaded;
      boolean bool2;
      if (bool1)
        bool2 = true;
      while (true)
      {
        return bool2;
        if (this.loadedHeaders != null)
        {
          boolean bool3 = this.loadedHeaders.containsKey(paramString.toUpperCase(Locale.ENGLISH));
          bool2 = bool3;
        }
        else
        {
          bool2 = false;
        }
      }
    }
    finally
    {
    }
  }

  // ERROR //
  private void loadBODYSTRUCTURE()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 58	com/sun/mail/imap/IMAPMessage:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   6: astore_2
    //   7: aload_2
    //   8: ifnull +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: aload_0
    //   15: invokevirtual 385	com/sun/mail/imap/IMAPMessage:getMessageCacheLock	()Ljava/lang/Object;
    //   18: astore_3
    //   19: aload_3
    //   20: monitorenter
    //   21: aload_0
    //   22: invokevirtual 389	com/sun/mail/imap/IMAPMessage:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   25: astore 7
    //   27: aload_0
    //   28: invokevirtual 392	com/sun/mail/imap/IMAPMessage:checkExpunged	()V
    //   31: aload_0
    //   32: aload 7
    //   34: aload_0
    //   35: invokevirtual 395	com/sun/mail/imap/IMAPMessage:getSequenceNumber	()I
    //   38: invokevirtual 399	com/sun/mail/imap/protocol/IMAPProtocol:fetchBodyStructure	(I)Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   41: putfield 58	com/sun/mail/imap/IMAPMessage:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   44: aload_0
    //   45: getfield 58	com/sun/mail/imap/IMAPMessage:bs	Lcom/sun/mail/imap/protocol/BODYSTRUCTURE;
    //   48: ifnonnull +70 -> 118
    //   51: aload_0
    //   52: invokevirtual 402	com/sun/mail/imap/IMAPMessage:forceCheckExpunged	()V
    //   55: new 132	javax/mail/MessagingException
    //   58: dup
    //   59: ldc_w 404
    //   62: invokespecial 405	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   65: athrow
    //   66: astore 5
    //   68: aload_3
    //   69: monitorexit
    //   70: aload 5
    //   72: athrow
    //   73: astore_1
    //   74: aload_0
    //   75: monitorexit
    //   76: aload_1
    //   77: athrow
    //   78: astore 6
    //   80: new 234	javax/mail/FolderClosedException
    //   83: dup
    //   84: aload_0
    //   85: getfield 409	com/sun/mail/imap/IMAPMessage:folder	Ljavax/mail/Folder;
    //   88: aload 6
    //   90: invokevirtual 237	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   93: invokespecial 240	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   96: athrow
    //   97: astore 4
    //   99: aload_0
    //   100: invokevirtual 402	com/sun/mail/imap/IMAPMessage:forceCheckExpunged	()V
    //   103: new 132	javax/mail/MessagingException
    //   106: dup
    //   107: aload 4
    //   109: invokevirtual 241	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   112: aload 4
    //   114: invokespecial 244	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   117: athrow
    //   118: aload_3
    //   119: monitorexit
    //   120: goto -109 -> 11
    //
    // Exception table:
    //   from	to	target	type
    //   21	44	66	finally
    //   44	66	66	finally
    //   68	70	66	finally
    //   80	97	66	finally
    //   99	118	66	finally
    //   118	120	66	finally
    //   2	7	73	finally
    //   14	21	73	finally
    //   70	73	73	finally
    //   21	44	78	com/sun/mail/iap/ConnectionException
    //   21	44	97	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  private void loadEnvelope()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 62	com/sun/mail/imap/IMAPMessage:envelope	Lcom/sun/mail/imap/protocol/ENVELOPE;
    //   6: astore_2
    //   7: aload_2
    //   8: ifnull +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: aconst_null
    //   15: checkcast 226	[Lcom/sun/mail/iap/Response;
    //   18: pop
    //   19: aload_0
    //   20: invokevirtual 385	com/sun/mail/imap/IMAPMessage:getMessageCacheLock	()Ljava/lang/Object;
    //   23: astore 4
    //   25: aload 4
    //   27: monitorenter
    //   28: aload_0
    //   29: invokevirtual 389	com/sun/mail/imap/IMAPMessage:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   32: astore 8
    //   34: aload_0
    //   35: invokevirtual 392	com/sun/mail/imap/IMAPMessage:checkExpunged	()V
    //   38: aload_0
    //   39: invokevirtual 395	com/sun/mail/imap/IMAPMessage:getSequenceNumber	()I
    //   42: istore 9
    //   44: aload 8
    //   46: iload 9
    //   48: getstatic 32	com/sun/mail/imap/IMAPMessage:EnvelopeCmd	Ljava/lang/String;
    //   51: invokevirtual 413	com/sun/mail/imap/protocol/IMAPProtocol:fetch	(ILjava/lang/String;)[Lcom/sun/mail/iap/Response;
    //   54: astore 10
    //   56: iconst_0
    //   57: istore 11
    //   59: iload 11
    //   61: aload 10
    //   63: arraylength
    //   64: if_icmplt +49 -> 113
    //   67: aload 8
    //   69: aload 10
    //   71: invokevirtual 416	com/sun/mail/imap/protocol/IMAPProtocol:notifyResponseHandlers	([Lcom/sun/mail/iap/Response;)V
    //   74: aload 8
    //   76: aload 10
    //   78: iconst_m1
    //   79: aload 10
    //   81: arraylength
    //   82: iadd
    //   83: aaload
    //   84: invokevirtual 420	com/sun/mail/imap/protocol/IMAPProtocol:handleResult	(Lcom/sun/mail/iap/Response;)V
    //   87: aload 4
    //   89: monitorexit
    //   90: aload_0
    //   91: getfield 62	com/sun/mail/imap/IMAPMessage:envelope	Lcom/sun/mail/imap/protocol/ENVELOPE;
    //   94: ifnonnull -83 -> 11
    //   97: new 132	javax/mail/MessagingException
    //   100: dup
    //   101: ldc_w 422
    //   104: invokespecial 405	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   107: athrow
    //   108: astore_1
    //   109: aload_0
    //   110: monitorexit
    //   111: aload_1
    //   112: athrow
    //   113: aload 10
    //   115: iload 11
    //   117: aaload
    //   118: ifnull +183 -> 301
    //   121: aload 10
    //   123: iload 11
    //   125: aaload
    //   126: instanceof 259
    //   129: ifeq +172 -> 301
    //   132: aload 10
    //   134: iload 11
    //   136: aaload
    //   137: checkcast 259	com/sun/mail/imap/protocol/FetchResponse
    //   140: invokevirtual 266	com/sun/mail/imap/protocol/FetchResponse:getNumber	()I
    //   143: iload 9
    //   145: if_icmpeq +6 -> 151
    //   148: goto +153 -> 301
    //   151: aload 10
    //   153: iload 11
    //   155: aaload
    //   156: checkcast 259	com/sun/mail/imap/protocol/FetchResponse
    //   159: astore 12
    //   161: aload 12
    //   163: invokevirtual 273	com/sun/mail/imap/protocol/FetchResponse:getItemCount	()I
    //   166: istore 13
    //   168: iconst_0
    //   169: istore 14
    //   171: iload 14
    //   173: iload 13
    //   175: if_icmpge +126 -> 301
    //   178: aload 12
    //   180: iload 14
    //   182: invokevirtual 277	com/sun/mail/imap/protocol/FetchResponse:getItem	(I)Lcom/sun/mail/imap/protocol/Item;
    //   185: astore 15
    //   187: aload 15
    //   189: instanceof 281
    //   192: ifeq +15 -> 207
    //   195: aload_0
    //   196: aload 15
    //   198: checkcast 281	com/sun/mail/imap/protocol/ENVELOPE
    //   201: putfield 62	com/sun/mail/imap/IMAPMessage:envelope	Lcom/sun/mail/imap/protocol/ENVELOPE;
    //   204: goto +103 -> 307
    //   207: aload 15
    //   209: instanceof 283
    //   212: ifeq +45 -> 257
    //   215: aload_0
    //   216: aload 15
    //   218: checkcast 283	com/sun/mail/imap/protocol/INTERNALDATE
    //   221: invokevirtual 287	com/sun/mail/imap/protocol/INTERNALDATE:getDate	()Ljava/util/Date;
    //   224: putfield 289	com/sun/mail/imap/IMAPMessage:receivedDate	Ljava/util/Date;
    //   227: goto +80 -> 307
    //   230: astore 7
    //   232: new 234	javax/mail/FolderClosedException
    //   235: dup
    //   236: aload_0
    //   237: getfield 409	com/sun/mail/imap/IMAPMessage:folder	Ljavax/mail/Folder;
    //   240: aload 7
    //   242: invokevirtual 237	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   245: invokespecial 240	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   248: athrow
    //   249: astore 6
    //   251: aload 4
    //   253: monitorexit
    //   254: aload 6
    //   256: athrow
    //   257: aload 15
    //   259: instanceof 291
    //   262: ifeq +45 -> 307
    //   265: aload_0
    //   266: aload 15
    //   268: checkcast 291	com/sun/mail/imap/protocol/RFC822SIZE
    //   271: getfield 292	com/sun/mail/imap/protocol/RFC822SIZE:size	I
    //   274: putfield 39	com/sun/mail/imap/IMAPMessage:size	I
    //   277: goto +30 -> 307
    //   280: astore 5
    //   282: aload_0
    //   283: invokevirtual 402	com/sun/mail/imap/IMAPMessage:forceCheckExpunged	()V
    //   286: new 132	javax/mail/MessagingException
    //   289: dup
    //   290: aload 5
    //   292: invokevirtual 241	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   295: aload 5
    //   297: invokespecial 244	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   300: athrow
    //   301: iinc 11 1
    //   304: goto -245 -> 59
    //   307: iinc 14 1
    //   310: goto -139 -> 171
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	108	finally
    //   14	28	108	finally
    //   90	108	108	finally
    //   254	257	108	finally
    //   28	56	230	com/sun/mail/iap/ConnectionException
    //   59	87	230	com/sun/mail/iap/ConnectionException
    //   113	148	230	com/sun/mail/iap/ConnectionException
    //   151	168	230	com/sun/mail/iap/ConnectionException
    //   178	204	230	com/sun/mail/iap/ConnectionException
    //   207	227	230	com/sun/mail/iap/ConnectionException
    //   257	277	230	com/sun/mail/iap/ConnectionException
    //   28	56	249	finally
    //   59	87	249	finally
    //   87	90	249	finally
    //   113	148	249	finally
    //   151	168	249	finally
    //   178	204	249	finally
    //   207	227	249	finally
    //   232	249	249	finally
    //   251	254	249	finally
    //   257	277	249	finally
    //   282	301	249	finally
    //   28	56	280	com/sun/mail/iap/ProtocolException
    //   59	87	280	com/sun/mail/iap/ProtocolException
    //   113	148	280	com/sun/mail/iap/ProtocolException
    //   151	168	280	com/sun/mail/iap/ProtocolException
    //   178	204	280	com/sun/mail/iap/ProtocolException
    //   207	227	280	com/sun/mail/iap/ProtocolException
    //   257	277	280	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  private void loadFlags()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 51	com/sun/mail/imap/IMAPMessage:flags	Ljavax/mail/Flags;
    //   6: astore_2
    //   7: aload_2
    //   8: ifnull +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: aload_0
    //   15: invokevirtual 385	com/sun/mail/imap/IMAPMessage:getMessageCacheLock	()Ljava/lang/Object;
    //   18: astore_3
    //   19: aload_3
    //   20: monitorenter
    //   21: aload_0
    //   22: invokevirtual 389	com/sun/mail/imap/IMAPMessage:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   25: astore 7
    //   27: aload_0
    //   28: invokevirtual 392	com/sun/mail/imap/IMAPMessage:checkExpunged	()V
    //   31: aload_0
    //   32: aload 7
    //   34: aload_0
    //   35: invokevirtual 395	com/sun/mail/imap/IMAPMessage:getSequenceNumber	()I
    //   38: invokevirtual 427	com/sun/mail/imap/protocol/IMAPProtocol:fetchFlags	(I)Ljavax/mail/Flags;
    //   41: putfield 51	com/sun/mail/imap/IMAPMessage:flags	Ljavax/mail/Flags;
    //   44: aload_3
    //   45: monitorexit
    //   46: goto -35 -> 11
    //   49: astore 5
    //   51: aload_3
    //   52: monitorexit
    //   53: aload 5
    //   55: athrow
    //   56: astore_1
    //   57: aload_0
    //   58: monitorexit
    //   59: aload_1
    //   60: athrow
    //   61: astore 6
    //   63: new 234	javax/mail/FolderClosedException
    //   66: dup
    //   67: aload_0
    //   68: getfield 409	com/sun/mail/imap/IMAPMessage:folder	Ljavax/mail/Folder;
    //   71: aload 6
    //   73: invokevirtual 237	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   76: invokespecial 240	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   79: athrow
    //   80: astore 4
    //   82: aload_0
    //   83: invokevirtual 402	com/sun/mail/imap/IMAPMessage:forceCheckExpunged	()V
    //   86: new 132	javax/mail/MessagingException
    //   89: dup
    //   90: aload 4
    //   92: invokevirtual 241	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   95: aload 4
    //   97: invokespecial 244	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   100: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   21	44	49	finally
    //   44	46	49	finally
    //   51	53	49	finally
    //   63	80	49	finally
    //   82	101	49	finally
    //   2	7	56	finally
    //   14	21	56	finally
    //   53	56	56	finally
    //   21	44	61	com/sun/mail/iap/ConnectionException
    //   21	44	80	com/sun/mail/iap/ProtocolException
  }

  // ERROR //
  private void loadHeaders()
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: getfield 45	com/sun/mail/imap/IMAPMessage:headersLoaded	Z
    //   6: istore_2
    //   7: iload_2
    //   8: ifeq +6 -> 14
    //   11: aload_0
    //   12: monitorexit
    //   13: return
    //   14: aload_0
    //   15: invokevirtual 385	com/sun/mail/imap/IMAPMessage:getMessageCacheLock	()Ljava/lang/Object;
    //   18: astore_3
    //   19: aload_3
    //   20: monitorenter
    //   21: aload_0
    //   22: invokevirtual 389	com/sun/mail/imap/IMAPMessage:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   25: astore 7
    //   27: aload_0
    //   28: invokevirtual 392	com/sun/mail/imap/IMAPMessage:checkExpunged	()V
    //   31: aload 7
    //   33: invokevirtual 105	com/sun/mail/imap/protocol/IMAPProtocol:isREV1	()Z
    //   36: ifeq +63 -> 99
    //   39: aload 7
    //   41: aload_0
    //   42: invokevirtual 395	com/sun/mail/imap/IMAPMessage:getSequenceNumber	()I
    //   45: aload_0
    //   46: ldc_w 430
    //   49: invokespecial 434	com/sun/mail/imap/IMAPMessage:toSection	(Ljava/lang/String;)Ljava/lang/String;
    //   52: invokevirtual 438	com/sun/mail/imap/protocol/IMAPProtocol:peekBody	(ILjava/lang/String;)Lcom/sun/mail/imap/protocol/BODY;
    //   55: astore 11
    //   57: aconst_null
    //   58: astore 9
    //   60: aload 11
    //   62: ifnull +14 -> 76
    //   65: aload 11
    //   67: invokevirtual 336	com/sun/mail/imap/protocol/BODY:getByteArrayInputStream	()Ljava/io/ByteArrayInputStream;
    //   70: astore 12
    //   72: aload 12
    //   74: astore 9
    //   76: aload_3
    //   77: monitorexit
    //   78: aload 9
    //   80: ifnonnull +102 -> 182
    //   83: new 132	javax/mail/MessagingException
    //   86: dup
    //   87: ldc_w 440
    //   90: invokespecial 405	javax/mail/MessagingException:<init>	(Ljava/lang/String;)V
    //   93: athrow
    //   94: astore_1
    //   95: aload_0
    //   96: monitorexit
    //   97: aload_1
    //   98: athrow
    //   99: aload 7
    //   101: aload_0
    //   102: invokevirtual 395	com/sun/mail/imap/IMAPMessage:getSequenceNumber	()I
    //   105: ldc_w 430
    //   108: invokevirtual 444	com/sun/mail/imap/protocol/IMAPProtocol:fetchRFC822	(ILjava/lang/String;)Lcom/sun/mail/imap/protocol/RFC822DATA;
    //   111: astore 8
    //   113: aconst_null
    //   114: astore 9
    //   116: aload 8
    //   118: ifnull -42 -> 76
    //   121: aload 8
    //   123: invokevirtual 320	com/sun/mail/imap/protocol/RFC822DATA:getByteArrayInputStream	()Ljava/io/ByteArrayInputStream;
    //   126: astore 10
    //   128: aload 10
    //   130: astore 9
    //   132: goto -56 -> 76
    //   135: astore 6
    //   137: new 234	javax/mail/FolderClosedException
    //   140: dup
    //   141: aload_0
    //   142: getfield 409	com/sun/mail/imap/IMAPMessage:folder	Ljavax/mail/Folder;
    //   145: aload 6
    //   147: invokevirtual 237	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   150: invokespecial 240	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   153: athrow
    //   154: astore 5
    //   156: aload_3
    //   157: monitorexit
    //   158: aload 5
    //   160: athrow
    //   161: astore 4
    //   163: aload_0
    //   164: invokevirtual 402	com/sun/mail/imap/IMAPMessage:forceCheckExpunged	()V
    //   167: new 132	javax/mail/MessagingException
    //   170: dup
    //   171: aload 4
    //   173: invokevirtual 241	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   176: aload 4
    //   178: invokespecial 244	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   181: athrow
    //   182: aload_0
    //   183: new 322	javax/mail/internet/InternetHeaders
    //   186: dup
    //   187: aload 9
    //   189: invokespecial 446	javax/mail/internet/InternetHeaders:<init>	(Ljava/io/InputStream;)V
    //   192: putfield 331	com/sun/mail/imap/IMAPMessage:headers	Ljavax/mail/internet/InternetHeaders;
    //   195: aload_0
    //   196: iconst_1
    //   197: putfield 45	com/sun/mail/imap/IMAPMessage:headersLoaded	Z
    //   200: goto -189 -> 11
    //
    // Exception table:
    //   from	to	target	type
    //   2	7	94	finally
    //   14	21	94	finally
    //   83	94	94	finally
    //   158	161	94	finally
    //   182	200	94	finally
    //   21	57	135	com/sun/mail/iap/ConnectionException
    //   65	72	135	com/sun/mail/iap/ConnectionException
    //   99	113	135	com/sun/mail/iap/ConnectionException
    //   121	128	135	com/sun/mail/iap/ConnectionException
    //   21	57	154	finally
    //   65	72	154	finally
    //   76	78	154	finally
    //   99	113	154	finally
    //   121	128	154	finally
    //   137	154	154	finally
    //   156	158	154	finally
    //   163	182	154	finally
    //   21	57	161	com/sun/mail/iap/ProtocolException
    //   65	72	161	com/sun/mail/iap/ProtocolException
    //   99	113	161	com/sun/mail/iap/ProtocolException
    //   121	128	161	com/sun/mail/iap/ProtocolException
  }

  private void setHeaderLoaded(String paramString)
  {
    try
    {
      if (this.loadedHeaders == null)
        this.loadedHeaders = new Hashtable(1);
      this.loadedHeaders.put(paramString.toUpperCase(Locale.ENGLISH), paramString);
      return;
    }
    finally
    {
    }
  }

  private void setHeadersLoaded(boolean paramBoolean)
  {
    try
    {
      this.headersLoaded = paramBoolean;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  private String toSection(String paramString)
  {
    if (this.sectionId == null)
      return paramString;
    return this.sectionId + "." + paramString;
  }

  Session _getSession()
  {
    return this.session;
  }

  void _setFlags(Flags paramFlags)
  {
    this.flags = paramFlags;
  }

  public void addFrom(Address[] paramArrayOfAddress)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void addHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void addHeaderLine(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void addRecipients(Message.RecipientType paramRecipientType, Address[] paramArrayOfAddress)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  protected void checkExpunged()
    throws MessageRemovedException
  {
    if (this.expunged)
      throw new MessageRemovedException();
  }

  protected void forceCheckExpunged()
    throws MessageRemovedException, FolderClosedException
  {
    try
    {
      synchronized (getMessageCacheLock())
      {
        try
        {
          getProtocol().noop();
          label14: if (this.expunged)
            throw new MessageRemovedException();
        }
        catch (ConnectionException localConnectionException)
        {
          throw new FolderClosedException(this.folder, localConnectionException.getMessage());
        }
      }
      return;
    }
    catch (ProtocolException localProtocolException)
    {
      break label14;
    }
  }

  public Enumeration getAllHeaderLines()
    throws MessagingException
  {
    checkExpunged();
    loadHeaders();
    return super.getAllHeaderLines();
  }

  public Enumeration getAllHeaders()
    throws MessagingException
  {
    checkExpunged();
    loadHeaders();
    return super.getAllHeaders();
  }

  public String getContentID()
    throws MessagingException
  {
    checkExpunged();
    loadBODYSTRUCTURE();
    return this.bs.id;
  }

  public String[] getContentLanguage()
    throws MessagingException
  {
    checkExpunged();
    loadBODYSTRUCTURE();
    if (this.bs.language != null)
      return (String[])this.bs.language.clone();
    return null;
  }

  public String getContentMD5()
    throws MessagingException
  {
    checkExpunged();
    loadBODYSTRUCTURE();
    return this.bs.md5;
  }

  protected InputStream getContentStream()
    throws MessagingException
  {
    int i = -1;
    boolean bool = getPeek();
    Object localObject3;
    try
    {
      synchronized (getMessageCacheLock())
      {
        try
        {
          IMAPProtocol localIMAPProtocol = getProtocol();
          checkExpunged();
          if ((localIMAPProtocol.isREV1()) && (getFetchBlockSize() != i))
          {
            String str = toSection("TEXT");
            if (this.bs != null)
              i = this.bs.size;
            IMAPInputStream localIMAPInputStream = new IMAPInputStream(this, str, i, bool);
            return localIMAPInputStream;
          }
          BODY localBODY;
          if (localIMAPProtocol.isREV1())
            if (bool)
            {
              localBODY = localIMAPProtocol.peekBody(getSequenceNumber(), toSection("TEXT"));
              localObject3 = null;
              if (localBODY != null)
              {
                ByteArrayInputStream localByteArrayInputStream1 = localBODY.getByteArrayInputStream();
                localObject3 = localByteArrayInputStream1;
              }
            }
          while (true)
          {
            if (localObject3 != null)
              break label254;
            throw new MessagingException("No content");
            localBODY = localIMAPProtocol.fetchBody(getSequenceNumber(), toSection("TEXT"));
            break;
            RFC822DATA localRFC822DATA = localIMAPProtocol.fetchRFC822(getSequenceNumber(), "TEXT");
            localObject3 = null;
            if (localRFC822DATA != null)
            {
              ByteArrayInputStream localByteArrayInputStream2 = localRFC822DATA.getByteArrayInputStream();
              localObject3 = localByteArrayInputStream2;
            }
          }
        }
        catch (ConnectionException localConnectionException)
        {
          throw new FolderClosedException(this.folder, localConnectionException.getMessage());
        }
      }
    }
    catch (ProtocolException localProtocolException)
    {
      forceCheckExpunged();
      throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
    }
    label254: return localObject3;
  }

  public String getContentType()
    throws MessagingException
  {
    checkExpunged();
    if (this.type == null)
    {
      loadBODYSTRUCTURE();
      this.type = new ContentType(this.bs.type, this.bs.subtype, this.bs.cParams).toString();
    }
    return this.type;
  }

  public DataHandler getDataHandler()
    throws MessagingException
  {
    while (true)
    {
      try
      {
        checkExpunged();
        if (this.dh == null)
        {
          loadBODYSTRUCTURE();
          if (this.type == null)
            this.type = new ContentType(this.bs.type, this.bs.subtype, this.bs.cParams).toString();
          if (this.bs.isMulti())
            this.dh = new DataHandler(new IMAPMultipartDataSource(this, this.bs.bodies, this.sectionId, this));
        }
        else
        {
          DataHandler localDataHandler = super.getDataHandler();
          return localDataHandler;
        }
        if ((!this.bs.isNested()) || (!isREV1()))
          continue;
        BODYSTRUCTURE localBODYSTRUCTURE = this.bs.bodies[0];
        ENVELOPE localENVELOPE = this.bs.envelope;
        if (this.sectionId == null)
        {
          localObject2 = "1";
          this.dh = new DataHandler(new IMAPNestedMessage(this, localBODYSTRUCTURE, localENVELOPE, (String)localObject2), this.type);
          continue;
        }
      }
      finally
      {
      }
      String str = this.sectionId + ".1";
      Object localObject2 = str;
    }
  }

  public String getDescription()
    throws MessagingException
  {
    checkExpunged();
    if (this.description != null)
      return this.description;
    loadBODYSTRUCTURE();
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
    checkExpunged();
    loadBODYSTRUCTURE();
    return this.bs.disposition;
  }

  public String getEncoding()
    throws MessagingException
  {
    checkExpunged();
    loadBODYSTRUCTURE();
    return this.bs.encoding;
  }

  protected int getFetchBlockSize()
  {
    return ((IMAPStore)this.folder.getStore()).getFetchBlockSize();
  }

  public String getFileName()
    throws MessagingException
  {
    checkExpunged();
    loadBODYSTRUCTURE();
    ParameterList localParameterList = this.bs.dParams;
    String str = null;
    if (localParameterList != null)
      str = this.bs.dParams.get("filename");
    if ((str == null) && (this.bs.cParams != null))
      str = this.bs.cParams.get("name");
    return str;
  }

  public Flags getFlags()
    throws MessagingException
  {
    try
    {
      checkExpunged();
      loadFlags();
      Flags localFlags = super.getFlags();
      return localFlags;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public Address[] getFrom()
    throws MessagingException
  {
    checkExpunged();
    loadEnvelope();
    return aaclone(this.envelope.from);
  }

  public String getHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    checkExpunged();
    if (getHeader(paramString1) == null)
      return null;
    return this.headers.getHeader(paramString1, paramString2);
  }

  public String[] getHeader(String paramString)
    throws MessagingException
  {
    checkExpunged();
    if (isHeaderLoaded(paramString))
      return this.headers.getHeader(paramString);
    Object localObject3;
    try
    {
      synchronized (getMessageCacheLock())
      {
        try
        {
          IMAPProtocol localIMAPProtocol = getProtocol();
          checkExpunged();
          if (localIMAPProtocol.isREV1())
          {
            BODY localBODY = localIMAPProtocol.peekBody(getSequenceNumber(), toSection("HEADER.FIELDS (" + paramString + ")"));
            localObject3 = null;
            if (localBODY != null)
            {
              ByteArrayInputStream localByteArrayInputStream2 = localBODY.getByteArrayInputStream();
              localObject3 = localByteArrayInputStream2;
            }
          }
          while (localObject3 == null)
          {
            return null;
            RFC822DATA localRFC822DATA = localIMAPProtocol.fetchRFC822(getSequenceNumber(), "HEADER.LINES (" + paramString + ")");
            localObject3 = null;
            if (localRFC822DATA != null)
            {
              ByteArrayInputStream localByteArrayInputStream1 = localRFC822DATA.getByteArrayInputStream();
              localObject3 = localByteArrayInputStream1;
            }
          }
        }
        catch (ConnectionException localConnectionException)
        {
          throw new FolderClosedException(this.folder, localConnectionException.getMessage());
        }
      }
    }
    catch (ProtocolException localProtocolException)
    {
      forceCheckExpunged();
      throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
    }
    if (this.headers == null)
      this.headers = new InternetHeaders();
    this.headers.load(localObject3);
    setHeaderLoaded(paramString);
    return this.headers.getHeader(paramString);
  }

  public String getInReplyTo()
    throws MessagingException
  {
    checkExpunged();
    loadEnvelope();
    return this.envelope.inReplyTo;
  }

  public int getLineCount()
    throws MessagingException
  {
    checkExpunged();
    loadBODYSTRUCTURE();
    return this.bs.lines;
  }

  public Enumeration getMatchingHeaderLines(String[] paramArrayOfString)
    throws MessagingException
  {
    checkExpunged();
    loadHeaders();
    return super.getMatchingHeaderLines(paramArrayOfString);
  }

  public Enumeration getMatchingHeaders(String[] paramArrayOfString)
    throws MessagingException
  {
    checkExpunged();
    loadHeaders();
    return super.getMatchingHeaders(paramArrayOfString);
  }

  protected Object getMessageCacheLock()
  {
    return ((IMAPFolder)this.folder).messageCacheLock;
  }

  public String getMessageID()
    throws MessagingException
  {
    checkExpunged();
    loadEnvelope();
    return this.envelope.messageId;
  }

  public Enumeration getNonMatchingHeaderLines(String[] paramArrayOfString)
    throws MessagingException
  {
    checkExpunged();
    loadHeaders();
    return super.getNonMatchingHeaderLines(paramArrayOfString);
  }

  public Enumeration getNonMatchingHeaders(String[] paramArrayOfString)
    throws MessagingException
  {
    checkExpunged();
    loadHeaders();
    return super.getNonMatchingHeaders(paramArrayOfString);
  }

  public boolean getPeek()
  {
    try
    {
      boolean bool = this.peek;
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected IMAPProtocol getProtocol()
    throws ProtocolException, FolderClosedException
  {
    ((IMAPFolder)this.folder).waitIfIdle();
    IMAPProtocol localIMAPProtocol = ((IMAPFolder)this.folder).protocol;
    if (localIMAPProtocol == null)
      throw new FolderClosedException(this.folder);
    return localIMAPProtocol;
  }

  public Date getReceivedDate()
    throws MessagingException
  {
    checkExpunged();
    loadEnvelope();
    if (this.receivedDate == null)
      return null;
    return new Date(this.receivedDate.getTime());
  }

  public Address[] getRecipients(Message.RecipientType paramRecipientType)
    throws MessagingException
  {
    checkExpunged();
    loadEnvelope();
    if (paramRecipientType == Message.RecipientType.TO)
      return aaclone(this.envelope.to);
    if (paramRecipientType == Message.RecipientType.CC)
      return aaclone(this.envelope.cc);
    if (paramRecipientType == Message.RecipientType.BCC)
      return aaclone(this.envelope.bcc);
    return super.getRecipients(paramRecipientType);
  }

  public Address[] getReplyTo()
    throws MessagingException
  {
    checkExpunged();
    loadEnvelope();
    return aaclone(this.envelope.replyTo);
  }

  public Address getSender()
    throws MessagingException
  {
    checkExpunged();
    loadEnvelope();
    if (this.envelope.sender != null)
      return this.envelope.sender[0];
    return null;
  }

  public Date getSentDate()
    throws MessagingException
  {
    checkExpunged();
    loadEnvelope();
    if (this.envelope.date == null)
      return null;
    return new Date(this.envelope.date.getTime());
  }

  protected int getSequenceNumber()
  {
    return this.seqnum;
  }

  public int getSize()
    throws MessagingException
  {
    checkExpunged();
    if (this.size == -1)
      loadEnvelope();
    return this.size;
  }

  public String getSubject()
    throws MessagingException
  {
    checkExpunged();
    if (this.subject != null)
      return this.subject;
    loadEnvelope();
    if (this.envelope.subject == null)
      return null;
    try
    {
      this.subject = MimeUtility.decodeText(this.envelope.subject);
      return this.subject;
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
      while (true)
        this.subject = this.envelope.subject;
    }
  }

  protected long getUID()
  {
    return this.uid;
  }

  public void invalidateHeaders()
  {
    try
    {
      this.headersLoaded = false;
      this.loadedHeaders = null;
      this.envelope = null;
      this.bs = null;
      this.receivedDate = null;
      this.size = -1;
      this.type = null;
      this.subject = null;
      this.description = null;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected boolean isREV1()
    throws FolderClosedException
  {
    IMAPProtocol localIMAPProtocol = ((IMAPFolder)this.folder).protocol;
    if (localIMAPProtocol == null)
      throw new FolderClosedException(this.folder);
    return localIMAPProtocol.isREV1();
  }

  public boolean isSet(Flags.Flag paramFlag)
    throws MessagingException
  {
    try
    {
      checkExpunged();
      loadFlags();
      boolean bool = super.isSet(paramFlag);
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void removeHeader(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setContentID(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setContentLanguage(String[] paramArrayOfString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setContentMD5(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setDataHandler(DataHandler paramDataHandler)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setDescription(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setDisposition(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  protected void setExpunged(boolean paramBoolean)
  {
    super.setExpunged(paramBoolean);
    this.seqnum = -1;
  }

  public void setFileName(String paramString)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  // ERROR //
  public void setFlags(Flags paramFlags, boolean paramBoolean)
    throws MessagingException
  {
    // Byte code:
    //   0: aload_0
    //   1: monitorenter
    //   2: aload_0
    //   3: invokevirtual 385	com/sun/mail/imap/IMAPMessage:getMessageCacheLock	()Ljava/lang/Object;
    //   6: astore 4
    //   8: aload 4
    //   10: monitorenter
    //   11: aload_0
    //   12: invokevirtual 389	com/sun/mail/imap/IMAPMessage:getProtocol	()Lcom/sun/mail/imap/protocol/IMAPProtocol;
    //   15: astore 8
    //   17: aload_0
    //   18: invokevirtual 392	com/sun/mail/imap/IMAPMessage:checkExpunged	()V
    //   21: aload 8
    //   23: aload_0
    //   24: invokevirtual 395	com/sun/mail/imap/IMAPMessage:getSequenceNumber	()I
    //   27: aload_1
    //   28: iload_2
    //   29: invokevirtual 768	com/sun/mail/imap/protocol/IMAPProtocol:storeFlags	(ILjavax/mail/Flags;Z)V
    //   32: aload 4
    //   34: monitorexit
    //   35: aload_0
    //   36: monitorexit
    //   37: return
    //   38: astore 7
    //   40: new 234	javax/mail/FolderClosedException
    //   43: dup
    //   44: aload_0
    //   45: getfield 409	com/sun/mail/imap/IMAPMessage:folder	Ljavax/mail/Folder;
    //   48: aload 7
    //   50: invokevirtual 237	com/sun/mail/iap/ConnectionException:getMessage	()Ljava/lang/String;
    //   53: invokespecial 240	javax/mail/FolderClosedException:<init>	(Ljavax/mail/Folder;Ljava/lang/String;)V
    //   56: athrow
    //   57: astore 6
    //   59: aload 4
    //   61: monitorexit
    //   62: aload 6
    //   64: athrow
    //   65: astore_3
    //   66: aload_0
    //   67: monitorexit
    //   68: aload_3
    //   69: athrow
    //   70: astore 5
    //   72: new 132	javax/mail/MessagingException
    //   75: dup
    //   76: aload 5
    //   78: invokevirtual 241	com/sun/mail/iap/ProtocolException:getMessage	()Ljava/lang/String;
    //   81: aload 5
    //   83: invokespecial 244	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   86: athrow
    //
    // Exception table:
    //   from	to	target	type
    //   11	32	38	com/sun/mail/iap/ConnectionException
    //   11	32	57	finally
    //   32	35	57	finally
    //   40	57	57	finally
    //   59	62	57	finally
    //   72	87	57	finally
    //   2	11	65	finally
    //   62	65	65	finally
    //   11	32	70	com/sun/mail/iap/ProtocolException
  }

  public void setFrom(Address paramAddress)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  protected void setMessageNumber(int paramInt)
  {
    super.setMessageNumber(paramInt);
  }

  public void setPeek(boolean paramBoolean)
  {
    try
    {
      this.peek = paramBoolean;
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setRecipients(Message.RecipientType paramRecipientType, Address[] paramArrayOfAddress)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setReplyTo(Address[] paramArrayOfAddress)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setSender(Address paramAddress)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  public void setSentDate(Date paramDate)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  protected void setSequenceNumber(int paramInt)
  {
    this.seqnum = paramInt;
  }

  public void setSubject(String paramString1, String paramString2)
    throws MessagingException
  {
    throw new IllegalWriteException("IMAPMessage is read-only");
  }

  protected void setUID(long paramLong)
  {
    this.uid = paramLong;
  }

  public void writeTo(OutputStream paramOutputStream)
    throws IOException, MessagingException
  {
    boolean bool = getPeek();
    Object localObject3;
    try
    {
      synchronized (getMessageCacheLock())
      {
        try
        {
          IMAPProtocol localIMAPProtocol = getProtocol();
          checkExpunged();
          BODY localBODY;
          if (localIMAPProtocol.isREV1())
            if (bool)
            {
              localBODY = localIMAPProtocol.peekBody(getSequenceNumber(), this.sectionId);
              localObject3 = null;
              if (localBODY != null)
              {
                ByteArrayInputStream localByteArrayInputStream1 = localBODY.getByteArrayInputStream();
                localObject3 = localByteArrayInputStream1;
              }
            }
          while (true)
          {
            if (localObject3 != null)
              break label185;
            throw new MessagingException("No content");
            localBODY = localIMAPProtocol.fetchBody(getSequenceNumber(), this.sectionId);
            break;
            RFC822DATA localRFC822DATA = localIMAPProtocol.fetchRFC822(getSequenceNumber(), null);
            localObject3 = null;
            if (localRFC822DATA != null)
            {
              ByteArrayInputStream localByteArrayInputStream2 = localRFC822DATA.getByteArrayInputStream();
              localObject3 = localByteArrayInputStream2;
            }
          }
        }
        catch (ConnectionException localConnectionException)
        {
          throw new FolderClosedException(this.folder, localConnectionException.getMessage());
        }
      }
    }
    catch (ProtocolException localProtocolException)
    {
      forceCheckExpunged();
      throw new MessagingException(localProtocolException.getMessage(), localProtocolException);
    }
    label185: byte[] arrayOfByte = new byte[1024];
    while (true)
    {
      int i = localObject3.read(arrayOfByte);
      if (i == -1)
        return;
      paramOutputStream.write(arrayOfByte, 0, i);
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.IMAPMessage
 * JD-Core Version:    0.6.2
 */