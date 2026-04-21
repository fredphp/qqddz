package javax.mail.internet;

import com.sun.mail.util.ASCIIUtility;
import com.sun.mail.util.FolderClosedIOException;
import com.sun.mail.util.LineOutputStream;
import com.sun.mail.util.MessageRemovedIOException;
import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.Enumeration;
import java.util.Vector;
import javax.activation.DataHandler;
import javax.activation.FileDataSource;
import javax.mail.BodyPart;
import javax.mail.FolderClosedException;
import javax.mail.Message;
import javax.mail.MessageRemovedException;
import javax.mail.MessagingException;
import javax.mail.Multipart;

public class MimeBodyPart extends BodyPart
  implements MimePart
{
  static boolean cacheMultipart;
  private static boolean decodeFileName;
  private static boolean encodeFileName;
  private static boolean setContentTypeFileName;
  private static boolean setDefaultTextCharset = true;
  private Object cachedContent;
  protected byte[] content;
  protected InputStream contentStream;
  protected DataHandler dh;
  protected InternetHeaders headers;

  static
  {
    setContentTypeFileName = true;
    encodeFileName = false;
    decodeFileName = false;
    cacheMultipart = true;
    try
    {
      String str1 = System.getProperty("mail.mime.setdefaulttextcharset");
      boolean bool1;
      boolean bool2;
      label67: boolean bool3;
      label97: boolean bool4;
      label127: boolean bool6;
      if ((str1 != null) && (str1.equalsIgnoreCase("false")))
      {
        bool1 = false;
        setDefaultTextCharset = bool1;
        String str2 = System.getProperty("mail.mime.setcontenttypefilename");
        if ((str2 == null) || (!str2.equalsIgnoreCase("false")))
          break label172;
        bool2 = false;
        setContentTypeFileName = bool2;
        String str3 = System.getProperty("mail.mime.encodefilename");
        if ((str3 == null) || (str3.equalsIgnoreCase("false")))
          break label178;
        bool3 = true;
        encodeFileName = bool3;
        String str4 = System.getProperty("mail.mime.decodefilename");
        if ((str4 == null) || (str4.equalsIgnoreCase("false")))
          break label184;
        bool4 = true;
        decodeFileName = bool4;
        String str5 = System.getProperty("mail.mime.cachemultipart");
        if (str5 == null)
          break label190;
        boolean bool5 = str5.equalsIgnoreCase("false");
        bool6 = false;
        if (!bool5)
          break label190;
      }
      while (true)
      {
        cacheMultipart = bool6;
        return;
        bool1 = true;
        break;
        label172: bool2 = true;
        break label67;
        label178: bool3 = false;
        break label97;
        label184: bool4 = false;
        break label127;
        label190: bool6 = true;
      }
    }
    catch (SecurityException localSecurityException)
    {
    }
  }

  public MimeBodyPart()
  {
    this.headers = new InternetHeaders();
  }

  public MimeBodyPart(InputStream paramInputStream)
    throws MessagingException
  {
    if ((!(paramInputStream instanceof ByteArrayInputStream)) && (!(paramInputStream instanceof BufferedInputStream)) && (!(paramInputStream instanceof SharedInputStream)))
      paramInputStream = new BufferedInputStream(paramInputStream);
    this.headers = new InternetHeaders(paramInputStream);
    if ((paramInputStream instanceof SharedInputStream))
    {
      SharedInputStream localSharedInputStream = (SharedInputStream)paramInputStream;
      this.contentStream = localSharedInputStream.newStream(localSharedInputStream.getPosition(), -1L);
      return;
    }
    try
    {
      this.content = ASCIIUtility.getBytes(paramInputStream);
      return;
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("Error reading input stream", localIOException);
    }
  }

  public MimeBodyPart(InternetHeaders paramInternetHeaders, byte[] paramArrayOfByte)
    throws MessagingException
  {
    this.headers = paramInternetHeaders;
    this.content = paramArrayOfByte;
  }

  static String[] getContentLanguage(MimePart paramMimePart)
    throws MessagingException
  {
    String str = paramMimePart.getHeader("Content-Language", null);
    if (str == null)
      return null;
    HeaderTokenizer localHeaderTokenizer = new HeaderTokenizer(str, "()<>@,;:\\\"\t []/?=");
    Vector localVector = new Vector();
    while (true)
    {
      HeaderTokenizer.Token localToken = localHeaderTokenizer.next();
      int i = localToken.getType();
      if (i == -4)
      {
        if (localVector.size() == 0)
          break;
        String[] arrayOfString = new String[localVector.size()];
        localVector.copyInto(arrayOfString);
        return arrayOfString;
      }
      if (i == -1)
        localVector.addElement(localToken.getValue());
    }
  }

  static String getDescription(MimePart paramMimePart)
    throws MessagingException
  {
    String str1 = paramMimePart.getHeader("Content-Description", null);
    if (str1 == null)
      return null;
    try
    {
      String str2 = MimeUtility.decodeText(MimeUtility.unfold(str1));
      return str2;
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
    }
    return str1;
  }

  static String getDisposition(MimePart paramMimePart)
    throws MessagingException
  {
    String str = paramMimePart.getHeader("Content-Disposition", null);
    if (str == null)
      return null;
    return new ContentDisposition(str).getDisposition();
  }

  static String getEncoding(MimePart paramMimePart)
    throws MessagingException
  {
    String str1 = paramMimePart.getHeader("Content-Transfer-Encoding", null);
    if (str1 == null)
      return null;
    String str2 = str1.trim();
    if ((str2.equalsIgnoreCase("7bit")) || (str2.equalsIgnoreCase("8bit")) || (str2.equalsIgnoreCase("quoted-printable")) || (str2.equalsIgnoreCase("binary")) || (str2.equalsIgnoreCase("base64")))
      return str2;
    HeaderTokenizer localHeaderTokenizer = new HeaderTokenizer(str2, "()<>@,;:\\\"\t []/?=");
    HeaderTokenizer.Token localToken;
    int i;
    do
    {
      localToken = localHeaderTokenizer.next();
      i = localToken.getType();
      if (i == -4)
        return str2;
    }
    while (i != -1);
    return localToken.getValue();
  }

  static String getFileName(MimePart paramMimePart)
    throws MessagingException
  {
    String str1 = paramMimePart.getHeader("Content-Disposition", null);
    Object localObject = null;
    if (str1 != null)
      localObject = new ContentDisposition(str1).getParameter("filename");
    String str3;
    if (localObject == null)
    {
      str3 = paramMimePart.getHeader("Content-Type", null);
      if (str3 == null);
    }
    try
    {
      String str4 = new ContentType(str3).getParameter("name");
      localObject = str4;
      label69: if ((decodeFileName) && (localObject != null));
      try
      {
        String str2 = MimeUtility.decodeText((String)localObject);
        localObject = str2;
        return localObject;
      }
      catch (UnsupportedEncodingException localUnsupportedEncodingException)
      {
        throw new MessagingException("Can't decode filename", localUnsupportedEncodingException);
      }
    }
    catch (ParseException localParseException)
    {
      break label69;
    }
  }

  static void invalidateContentHeaders(MimePart paramMimePart)
    throws MessagingException
  {
    paramMimePart.removeHeader("Content-Type");
    paramMimePart.removeHeader("Content-Transfer-Encoding");
  }

  static boolean isMimeType(MimePart paramMimePart, String paramString)
    throws MessagingException
  {
    try
    {
      boolean bool = new ContentType(paramMimePart.getContentType()).match(paramString);
      return bool;
    }
    catch (ParseException localParseException)
    {
    }
    return paramMimePart.getContentType().equalsIgnoreCase(paramString);
  }

  static void setContentLanguage(MimePart paramMimePart, String[] paramArrayOfString)
    throws MessagingException
  {
    StringBuffer localStringBuffer = new StringBuffer(paramArrayOfString[0]);
    for (int i = 1; ; i++)
    {
      if (i >= paramArrayOfString.length)
      {
        paramMimePart.setHeader("Content-Language", localStringBuffer.toString());
        return;
      }
      localStringBuffer.append(',').append(paramArrayOfString[i]);
    }
  }

  static void setDescription(MimePart paramMimePart, String paramString1, String paramString2)
    throws MessagingException
  {
    if (paramString1 == null)
    {
      paramMimePart.removeHeader("Content-Description");
      return;
    }
    try
    {
      paramMimePart.setHeader("Content-Description", MimeUtility.fold(21, MimeUtility.encodeText(paramString1, paramString2, null)));
      return;
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
      throw new MessagingException("Encoding error", localUnsupportedEncodingException);
    }
  }

  static void setDisposition(MimePart paramMimePart, String paramString)
    throws MessagingException
  {
    if (paramString == null)
    {
      paramMimePart.removeHeader("Content-Disposition");
      return;
    }
    String str = paramMimePart.getHeader("Content-Disposition", null);
    if (str != null)
    {
      ContentDisposition localContentDisposition = new ContentDisposition(str);
      localContentDisposition.setDisposition(paramString);
      paramString = localContentDisposition.toString();
    }
    paramMimePart.setHeader("Content-Disposition", paramString);
  }

  static void setEncoding(MimePart paramMimePart, String paramString)
    throws MessagingException
  {
    paramMimePart.setHeader("Content-Transfer-Encoding", paramString);
  }

  // ERROR //
  static void setFileName(MimePart paramMimePart, String paramString)
    throws MessagingException
  {
    // Byte code:
    //   0: getstatic 32	javax/mail/internet/MimeBodyPart:encodeFileName	Z
    //   3: ifeq +16 -> 19
    //   6: aload_1
    //   7: ifnull +12 -> 19
    //   10: aload_1
    //   11: invokestatic 261	javax/mail/internet/MimeUtility:encodeText	(Ljava/lang/String;)Ljava/lang/String;
    //   14: astore 9
    //   16: aload 9
    //   18: astore_1
    //   19: aload_0
    //   20: ldc 168
    //   22: aconst_null
    //   23: invokeinterface 116 3 0
    //   28: astore_2
    //   29: aload_2
    //   30: ifnonnull +108 -> 138
    //   33: ldc_w 263
    //   36: astore_3
    //   37: new 170	javax/mail/internet/ContentDisposition
    //   40: dup
    //   41: aload_3
    //   42: invokespecial 173	javax/mail/internet/ContentDisposition:<init>	(Ljava/lang/String;)V
    //   45: astore 4
    //   47: aload 4
    //   49: ldc 196
    //   51: aload_1
    //   52: invokevirtual 266	javax/mail/internet/ContentDisposition:setParameter	(Ljava/lang/String;Ljava/lang/String;)V
    //   55: aload_0
    //   56: ldc 168
    //   58: aload 4
    //   60: invokevirtual 257	javax/mail/internet/ContentDisposition:toString	()Ljava/lang/String;
    //   63: invokeinterface 233 3 0
    //   68: getstatic 30	javax/mail/internet/MimeBodyPart:setContentTypeFileName	Z
    //   71: ifeq +51 -> 122
    //   74: aload_0
    //   75: ldc 201
    //   77: aconst_null
    //   78: invokeinterface 116 3 0
    //   83: astore 5
    //   85: aload 5
    //   87: ifnull +35 -> 122
    //   90: new 203	javax/mail/internet/ContentType
    //   93: dup
    //   94: aload 5
    //   96: invokespecial 204	javax/mail/internet/ContentType:<init>	(Ljava/lang/String;)V
    //   99: astore 6
    //   101: aload 6
    //   103: ldc 206
    //   105: aload_1
    //   106: invokevirtual 267	javax/mail/internet/ContentType:setParameter	(Ljava/lang/String;Ljava/lang/String;)V
    //   109: aload_0
    //   110: ldc 201
    //   112: aload 6
    //   114: invokevirtual 268	javax/mail/internet/ContentType:toString	()Ljava/lang/String;
    //   117: invokeinterface 233 3 0
    //   122: return
    //   123: astore 8
    //   125: new 71	javax/mail/MessagingException
    //   128: dup
    //   129: ldc_w 270
    //   132: aload 8
    //   134: invokespecial 107	javax/mail/MessagingException:<init>	(Ljava/lang/String;Ljava/lang/Exception;)V
    //   137: athrow
    //   138: aload_2
    //   139: astore_3
    //   140: goto -103 -> 37
    //   143: astore 7
    //   145: return
    //
    // Exception table:
    //   from	to	target	type
    //   10	16	123	java/io/UnsupportedEncodingException
    //   90	122	143	javax/mail/internet/ParseException
  }

  static void setText(MimePart paramMimePart, String paramString1, String paramString2, String paramString3)
    throws MessagingException
  {
    if (paramString2 == null)
      if (MimeUtility.checkAscii(paramString1) == 1)
        break label56;
    label56: for (paramString2 = MimeUtility.getDefaultMIMECharset(); ; paramString2 = "us-ascii")
    {
      paramMimePart.setContent(paramString1, "text/" + paramString3 + "; charset=" + MimeUtility.quote(paramString2, "()<>@,;:\\\"\t []/?="));
      return;
    }
  }

  static void updateHeaders(MimePart paramMimePart)
    throws MessagingException
  {
    DataHandler localDataHandler = paramMimePart.getDataHandler();
    if (localDataHandler == null)
      return;
    label293: label424: 
    while (true)
    {
      String str1;
      ContentType localContentType;
      int j;
      Object localObject2;
      try
      {
        str1 = localDataHandler.getContentType();
        if (paramMimePart.getHeader("Content-Type") == null)
        {
          i = 1;
          localContentType = new ContentType(str1);
          if (!localContentType.match("multipart/*"))
            break label400;
          j = 1;
          if (!(paramMimePart instanceof MimeBodyPart))
            break label302;
          MimeBodyPart localMimeBodyPart = (MimeBodyPart)paramMimePart;
          if (localMimeBodyPart.cachedContent == null)
            break label293;
          localObject1 = localMimeBodyPart.cachedContent;
          if (!(localObject1 instanceof MimeMultipart))
            break label351;
          ((MimeMultipart)localObject1).updateHeaders();
          if (j == 0)
          {
            if (paramMimePart.getHeader("Content-Transfer-Encoding") == null)
              setEncoding(paramMimePart, MimeUtility.getEncoding(localDataHandler));
            if ((i != 0) && (setDefaultTextCharset) && (localContentType.match("text/*")) && (localContentType.getParameter("charset") == null))
            {
              String str4 = paramMimePart.getEncoding();
              if ((str4 == null) || (!str4.equalsIgnoreCase("7bit")))
                break label424;
              localObject2 = "us-ascii";
              localContentType.setParameter("charset", (String)localObject2);
              str1 = localContentType.toString();
            }
          }
          if (i == 0)
            break;
          String str2 = paramMimePart.getHeader("Content-Disposition", null);
          if (str2 != null)
          {
            String str3 = new ContentDisposition(str2).getParameter("filename");
            if (str3 != null)
            {
              localContentType.setParameter("name", str3);
              str1 = localContentType.toString();
            }
          }
          paramMimePart.setHeader("Content-Type", str1);
          return;
        }
      }
      catch (IOException localIOException)
      {
        MessagingException localMessagingException = new MessagingException("IOException updating headers", localIOException);
        throw localMessagingException;
      }
      int i = 0;
      continue;
      Object localObject1 = localDataHandler.getContent();
      continue;
      label302: if ((paramMimePart instanceof MimeMessage))
      {
        MimeMessage localMimeMessage = (MimeMessage)paramMimePart;
        if (localMimeMessage.cachedContent != null)
          localObject1 = localMimeMessage.cachedContent;
        else
          localObject1 = localDataHandler.getContent();
      }
      else
      {
        localObject1 = localDataHandler.getContent();
        continue;
        label351: throw new MessagingException("MIME part of type \"" + str1 + "\" contains object of type " + localObject1.getClass().getName() + " instead of MimeMultipart");
        boolean bool = localContentType.match("message/rfc822");
        j = 0;
        if (bool)
        {
          j = 1;
          continue;
          String str5 = MimeUtility.getDefaultMIMECharset();
          localObject2 = str5;
        }
      }
    }
  }

  static void writeTo(MimePart paramMimePart, OutputStream paramOutputStream, String[] paramArrayOfString)
    throws IOException, MessagingException
  {
    LineOutputStream localLineOutputStream;
    Enumeration localEnumeration;
    if ((paramOutputStream instanceof LineOutputStream))
    {
      localLineOutputStream = (LineOutputStream)paramOutputStream;
      localEnumeration = paramMimePart.getNonMatchingHeaderLines(paramArrayOfString);
    }
    while (true)
    {
      if (!localEnumeration.hasMoreElements())
      {
        localLineOutputStream.writeln();
        OutputStream localOutputStream = MimeUtility.encode(paramOutputStream, paramMimePart.getEncoding());
        paramMimePart.getDataHandler().writeTo(localOutputStream);
        localOutputStream.flush();
        return;
        localLineOutputStream = new LineOutputStream(paramOutputStream);
        break;
      }
      localLineOutputStream.writeln((String)localEnumeration.nextElement());
    }
  }

  public void addHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    this.headers.addHeader(paramString1, paramString2);
  }

  public void addHeaderLine(String paramString)
    throws MessagingException
  {
    this.headers.addHeaderLine(paramString);
  }

  public void attachFile(File paramFile)
    throws IOException, MessagingException
  {
    FileDataSource localFileDataSource = new FileDataSource(paramFile);
    setDataHandler(new DataHandler(localFileDataSource));
    setFileName(localFileDataSource.getName());
  }

  public void attachFile(String paramString)
    throws IOException, MessagingException
  {
    attachFile(new File(paramString));
  }

  public Enumeration getAllHeaderLines()
    throws MessagingException
  {
    return this.headers.getAllHeaderLines();
  }

  public Enumeration getAllHeaders()
    throws MessagingException
  {
    return this.headers.getAllHeaders();
  }

  public Object getContent()
    throws IOException, MessagingException
  {
    Object localObject2;
    if (this.cachedContent != null)
      localObject2 = this.cachedContent;
    while (true)
    {
      return localObject2;
      try
      {
        Object localObject1 = getDataHandler().getContent();
        localObject2 = localObject1;
        if ((!cacheMultipart) || ((!(localObject2 instanceof Multipart)) && (!(localObject2 instanceof Message))) || ((this.content == null) && (this.contentStream == null)))
          continue;
        this.cachedContent = localObject2;
        return localObject2;
      }
      catch (FolderClosedIOException localFolderClosedIOException)
      {
        throw new FolderClosedException(localFolderClosedIOException.getFolder(), localFolderClosedIOException.getMessage());
      }
      catch (MessageRemovedIOException localMessageRemovedIOException)
      {
        throw new MessageRemovedException(localMessageRemovedIOException.getMessage());
      }
    }
  }

  public String getContentID()
    throws MessagingException
  {
    return getHeader("Content-Id", null);
  }

  public String[] getContentLanguage()
    throws MessagingException
  {
    return getContentLanguage(this);
  }

  public String getContentMD5()
    throws MessagingException
  {
    return getHeader("Content-MD5", null);
  }

  protected InputStream getContentStream()
    throws MessagingException
  {
    if (this.contentStream != null)
      return ((SharedInputStream)this.contentStream).newStream(0L, -1L);
    if (this.content != null)
      return new ByteArrayInputStream(this.content);
    throw new MessagingException("No content");
  }

  public String getContentType()
    throws MessagingException
  {
    String str = getHeader("Content-Type", null);
    if (str == null)
      str = "text/plain";
    return str;
  }

  public DataHandler getDataHandler()
    throws MessagingException
  {
    if (this.dh == null)
      this.dh = new DataHandler(new MimePartDataSource(this));
    return this.dh;
  }

  public String getDescription()
    throws MessagingException
  {
    return getDescription(this);
  }

  public String getDisposition()
    throws MessagingException
  {
    return getDisposition(this);
  }

  public String getEncoding()
    throws MessagingException
  {
    return getEncoding(this);
  }

  public String getFileName()
    throws MessagingException
  {
    return getFileName(this);
  }

  public String getHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    return this.headers.getHeader(paramString1, paramString2);
  }

  public String[] getHeader(String paramString)
    throws MessagingException
  {
    return this.headers.getHeader(paramString);
  }

  public InputStream getInputStream()
    throws IOException, MessagingException
  {
    return getDataHandler().getInputStream();
  }

  public int getLineCount()
    throws MessagingException
  {
    return -1;
  }

  public Enumeration getMatchingHeaderLines(String[] paramArrayOfString)
    throws MessagingException
  {
    return this.headers.getMatchingHeaderLines(paramArrayOfString);
  }

  public Enumeration getMatchingHeaders(String[] paramArrayOfString)
    throws MessagingException
  {
    return this.headers.getMatchingHeaders(paramArrayOfString);
  }

  public Enumeration getNonMatchingHeaderLines(String[] paramArrayOfString)
    throws MessagingException
  {
    return this.headers.getNonMatchingHeaderLines(paramArrayOfString);
  }

  public Enumeration getNonMatchingHeaders(String[] paramArrayOfString)
    throws MessagingException
  {
    return this.headers.getNonMatchingHeaders(paramArrayOfString);
  }

  public InputStream getRawInputStream()
    throws MessagingException
  {
    return getContentStream();
  }

  public int getSize()
    throws MessagingException
  {
    int j;
    if (this.content != null)
      j = this.content.length;
    while (true)
    {
      return j;
      if (this.contentStream != null);
      try
      {
        int i = this.contentStream.available();
        j = i;
        if (j > 0)
          continue;
        label36: return -1;
      }
      catch (IOException localIOException)
      {
        break label36;
      }
    }
  }

  public boolean isMimeType(String paramString)
    throws MessagingException
  {
    return isMimeType(this, paramString);
  }

  public void removeHeader(String paramString)
    throws MessagingException
  {
    this.headers.removeHeader(paramString);
  }

  // ERROR //
  public void saveFile(File paramFile)
    throws IOException, MessagingException
  {
    // Byte code:
    //   0: aconst_null
    //   1: astore_2
    //   2: new 517	java/io/BufferedOutputStream
    //   5: dup
    //   6: new 519	java/io/FileOutputStream
    //   9: dup
    //   10: aload_1
    //   11: invokespecial 520	java/io/FileOutputStream:<init>	(Ljava/io/File;)V
    //   14: invokespecial 521	java/io/BufferedOutputStream:<init>	(Ljava/io/OutputStream;)V
    //   17: astore_3
    //   18: aload_0
    //   19: invokevirtual 522	javax/mail/internet/MimeBodyPart:getInputStream	()Ljava/io/InputStream;
    //   22: astore_2
    //   23: sipush 8192
    //   26: newarray byte
    //   28: astore 8
    //   30: aload_2
    //   31: aload 8
    //   33: invokevirtual 526	java/io/InputStream:read	([B)I
    //   36: istore 9
    //   38: iload 9
    //   40: ifgt +20 -> 60
    //   43: aload_2
    //   44: ifnull +7 -> 51
    //   47: aload_2
    //   48: invokevirtual 529	java/io/InputStream:close	()V
    //   51: aload_3
    //   52: ifnull +7 -> 59
    //   55: aload_3
    //   56: invokevirtual 530	java/io/OutputStream:close	()V
    //   59: return
    //   60: aload_3
    //   61: aload 8
    //   63: iconst_0
    //   64: iload 9
    //   66: invokevirtual 534	java/io/OutputStream:write	([BII)V
    //   69: goto -39 -> 30
    //   72: astore 4
    //   74: aload_3
    //   75: astore 5
    //   77: aload_2
    //   78: ifnull +7 -> 85
    //   81: aload_2
    //   82: invokevirtual 529	java/io/InputStream:close	()V
    //   85: aload 5
    //   87: ifnull +8 -> 95
    //   90: aload 5
    //   92: invokevirtual 530	java/io/OutputStream:close	()V
    //   95: aload 4
    //   97: athrow
    //   98: astore 7
    //   100: goto -15 -> 85
    //   103: astore 6
    //   105: goto -10 -> 95
    //   108: astore 11
    //   110: goto -59 -> 51
    //   113: astore 10
    //   115: return
    //   116: astore 4
    //   118: aconst_null
    //   119: astore_2
    //   120: aconst_null
    //   121: astore 5
    //   123: goto -46 -> 77
    //
    // Exception table:
    //   from	to	target	type
    //   18	30	72	finally
    //   30	38	72	finally
    //   60	69	72	finally
    //   81	85	98	java/io/IOException
    //   90	95	103	java/io/IOException
    //   47	51	108	java/io/IOException
    //   55	59	113	java/io/IOException
    //   2	18	116	finally
  }

  public void saveFile(String paramString)
    throws IOException, MessagingException
  {
    saveFile(new File(paramString));
  }

  public void setContent(Object paramObject, String paramString)
    throws MessagingException
  {
    if ((paramObject instanceof Multipart))
    {
      setContent((Multipart)paramObject);
      return;
    }
    setDataHandler(new DataHandler(paramObject, paramString));
  }

  public void setContent(Multipart paramMultipart)
    throws MessagingException
  {
    setDataHandler(new DataHandler(paramMultipart, paramMultipart.getContentType()));
    paramMultipart.setParent(this);
  }

  public void setContentID(String paramString)
    throws MessagingException
  {
    if (paramString == null)
    {
      removeHeader("Content-ID");
      return;
    }
    setHeader("Content-ID", paramString);
  }

  public void setContentLanguage(String[] paramArrayOfString)
    throws MessagingException
  {
    setContentLanguage(this, paramArrayOfString);
  }

  public void setContentMD5(String paramString)
    throws MessagingException
  {
    setHeader("Content-MD5", paramString);
  }

  public void setDataHandler(DataHandler paramDataHandler)
    throws MessagingException
  {
    this.dh = paramDataHandler;
    this.cachedContent = null;
    invalidateContentHeaders(this);
  }

  public void setDescription(String paramString)
    throws MessagingException
  {
    setDescription(paramString, null);
  }

  public void setDescription(String paramString1, String paramString2)
    throws MessagingException
  {
    setDescription(this, paramString1, paramString2);
  }

  public void setDisposition(String paramString)
    throws MessagingException
  {
    setDisposition(this, paramString);
  }

  public void setFileName(String paramString)
    throws MessagingException
  {
    setFileName(this, paramString);
  }

  public void setHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    this.headers.setHeader(paramString1, paramString2);
  }

  public void setText(String paramString)
    throws MessagingException
  {
    setText(paramString, null);
  }

  public void setText(String paramString1, String paramString2)
    throws MessagingException
  {
    setText(this, paramString1, paramString2, "plain");
  }

  public void setText(String paramString1, String paramString2, String paramString3)
    throws MessagingException
  {
    setText(this, paramString1, paramString2, paramString3);
  }

  protected void updateHeaders()
    throws MessagingException
  {
    updateHeaders(this);
    if (this.cachedContent != null)
    {
      this.dh = new DataHandler(this.cachedContent, getContentType());
      this.cachedContent = null;
      this.content = null;
      if (this.contentStream == null);
    }
    try
    {
      this.contentStream.close();
      label54: this.contentStream = null;
      return;
    }
    catch (IOException localIOException)
    {
      break label54;
    }
  }

  public void writeTo(OutputStream paramOutputStream)
    throws IOException, MessagingException
  {
    writeTo(this, paramOutputStream, null);
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.MimeBodyPart
 * JD-Core Version:    0.6.2
 */