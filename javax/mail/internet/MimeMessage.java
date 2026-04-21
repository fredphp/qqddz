package javax.mail.internet;

import com.sun.mail.util.ASCIIUtility;
import com.sun.mail.util.FolderClosedIOException;
import com.sun.mail.util.LineOutputStream;
import com.sun.mail.util.MessageRemovedIOException;
import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectStreamException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.util.Date;
import java.util.Enumeration;
import java.util.Vector;
import javax.activation.DataHandler;
import javax.mail.Address;
import javax.mail.Flags;
import javax.mail.Flags.Flag;
import javax.mail.Folder;
import javax.mail.FolderClosedException;
import javax.mail.Message;
import javax.mail.Message.RecipientType;
import javax.mail.MessageRemovedException;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.util.SharedByteArrayInputStream;

public class MimeMessage extends Message
  implements MimePart
{
  private static final Flags answeredFlag = new Flags(Flags.Flag.ANSWERED);
  private static MailDateFormat mailDateFormat = new MailDateFormat();
  Object cachedContent;
  protected byte[] content;
  protected InputStream contentStream;
  protected DataHandler dh;
  protected Flags flags;
  protected InternetHeaders headers;
  protected boolean modified = false;
  protected boolean saved = false;
  private boolean strict = true;

  protected MimeMessage(Folder paramFolder, int paramInt)
  {
    super(paramFolder, paramInt);
    this.flags = new Flags();
    this.saved = true;
    initStrict();
  }

  protected MimeMessage(Folder paramFolder, InputStream paramInputStream, int paramInt)
    throws MessagingException
  {
    this(paramFolder, paramInt);
    initStrict();
    parse(paramInputStream);
  }

  protected MimeMessage(Folder paramFolder, InternetHeaders paramInternetHeaders, byte[] paramArrayOfByte, int paramInt)
    throws MessagingException
  {
    this(paramFolder, paramInt);
    this.headers = paramInternetHeaders;
    this.content = paramArrayOfByte;
    initStrict();
  }

  public MimeMessage(Session paramSession)
  {
    super(paramSession);
    this.modified = true;
    this.headers = new InternetHeaders();
    this.flags = new Flags();
    initStrict();
  }

  public MimeMessage(Session paramSession, InputStream paramInputStream)
    throws MessagingException
  {
    super(paramSession);
    this.flags = new Flags();
    initStrict();
    parse(paramInputStream);
    this.saved = true;
  }

  public MimeMessage(MimeMessage paramMimeMessage)
    throws MessagingException
  {
    super(paramMimeMessage.session);
    this.flags = paramMimeMessage.getFlags();
    int i = paramMimeMessage.getSize();
    ByteArrayOutputStream localByteArrayOutputStream;
    if (i > 0)
      localByteArrayOutputStream = new ByteArrayOutputStream(i);
    try
    {
      while (true)
      {
        this.strict = paramMimeMessage.strict;
        paramMimeMessage.writeTo(localByteArrayOutputStream);
        localByteArrayOutputStream.close();
        SharedByteArrayInputStream localSharedByteArrayInputStream = new SharedByteArrayInputStream(localByteArrayOutputStream.toByteArray());
        parse(localSharedByteArrayInputStream);
        localSharedByteArrayInputStream.close();
        this.saved = true;
        return;
        localByteArrayOutputStream = new ByteArrayOutputStream();
      }
    }
    catch (IOException localIOException)
    {
      throw new MessagingException("IOException while copying message", localIOException);
    }
  }

  private void addAddressHeader(String paramString, Address[] paramArrayOfAddress)
    throws MessagingException
  {
    String str = InternetAddress.toString(paramArrayOfAddress);
    if (str == null)
      return;
    addHeader(paramString, str);
  }

  private Address[] eliminateDuplicates(Vector paramVector, Address[] paramArrayOfAddress)
  {
    if (paramArrayOfAddress == null)
      return null;
    int i = 0;
    int j = 0;
    Object localObject;
    label38: int i1;
    int i2;
    if (j >= paramArrayOfAddress.length)
      if (i != 0)
      {
        if (!(paramArrayOfAddress instanceof InternetAddress[]))
          break label133;
        localObject = new InternetAddress[paramArrayOfAddress.length - i];
        i1 = 0;
        i2 = 0;
      }
    while (true)
    {
      if (i1 >= paramArrayOfAddress.length)
      {
        paramArrayOfAddress = (Address[])localObject;
        return paramArrayOfAddress;
        label127: for (int k = 0; ; k++)
        {
          int m = paramVector.size();
          int n = 0;
          if (k >= m);
          while (true)
          {
            if (n == 0)
              paramVector.addElement(paramArrayOfAddress[j]);
            j++;
            break;
            if (!((InternetAddress)paramVector.elementAt(k)).equals(paramArrayOfAddress[j]))
              break label127;
            n = 1;
            i++;
            paramArrayOfAddress[j] = null;
          }
        }
        label133: localObject = new Address[paramArrayOfAddress.length - i];
        break label38;
      }
      if (paramArrayOfAddress[i1] != null)
      {
        int i3 = i2 + 1;
        localObject[i2] = paramArrayOfAddress[i1];
        i2 = i3;
      }
      i1++;
    }
  }

  private Address[] getAddressHeader(String paramString)
    throws MessagingException
  {
    String str = getHeader(paramString, ",");
    if (str == null)
      return null;
    return InternetAddress.parseHeader(str, this.strict);
  }

  private String getHeaderName(Message.RecipientType paramRecipientType)
    throws MessagingException
  {
    if (paramRecipientType == Message.RecipientType.TO)
      return "To";
    if (paramRecipientType == Message.RecipientType.CC)
      return "Cc";
    if (paramRecipientType == Message.RecipientType.BCC)
      return "Bcc";
    if (paramRecipientType == RecipientType.NEWSGROUPS)
      return "Newsgroups";
    throw new MessagingException("Invalid Recipient Type");
  }

  private void initStrict()
  {
    if (this.session != null)
    {
      String str = this.session.getProperty("mail.mime.address.strict");
      if ((str == null) || (!str.equalsIgnoreCase("false")))
        break label38;
    }
    label38: for (boolean bool = false; ; bool = true)
    {
      this.strict = bool;
      return;
    }
  }

  private void setAddressHeader(String paramString, Address[] paramArrayOfAddress)
    throws MessagingException
  {
    String str = InternetAddress.toString(paramArrayOfAddress);
    if (str == null)
    {
      removeHeader(paramString);
      return;
    }
    setHeader(paramString, str);
  }

  public void addFrom(Address[] paramArrayOfAddress)
    throws MessagingException
  {
    addAddressHeader("From", paramArrayOfAddress);
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

  public void addRecipients(Message.RecipientType paramRecipientType, String paramString)
    throws MessagingException
  {
    if (paramRecipientType == RecipientType.NEWSGROUPS)
    {
      if ((paramString != null) && (paramString.length() != 0))
        addHeader("Newsgroups", paramString);
      return;
    }
    addAddressHeader(getHeaderName(paramRecipientType), InternetAddress.parse(paramString));
  }

  public void addRecipients(Message.RecipientType paramRecipientType, Address[] paramArrayOfAddress)
    throws MessagingException
  {
    if (paramRecipientType == RecipientType.NEWSGROUPS)
    {
      String str = NewsAddress.toString(paramArrayOfAddress);
      if (str != null)
        addHeader("Newsgroups", str);
      return;
    }
    addAddressHeader(getHeaderName(paramRecipientType), paramArrayOfAddress);
  }

  protected InternetHeaders createInternetHeaders(InputStream paramInputStream)
    throws MessagingException
  {
    return new InternetHeaders(paramInputStream);
  }

  protected MimeMessage createMimeMessage(Session paramSession)
    throws MessagingException
  {
    return new MimeMessage(paramSession);
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

  public Address[] getAllRecipients()
    throws MessagingException
  {
    Address[] arrayOfAddress1 = super.getAllRecipients();
    Address[] arrayOfAddress2 = getRecipients(RecipientType.NEWSGROUPS);
    if (arrayOfAddress2 == null)
      return arrayOfAddress1;
    if (arrayOfAddress1 == null)
      return arrayOfAddress2;
    Address[] arrayOfAddress3 = new Address[arrayOfAddress1.length + arrayOfAddress2.length];
    System.arraycopy(arrayOfAddress1, 0, arrayOfAddress3, 0, arrayOfAddress1.length);
    System.arraycopy(arrayOfAddress2, 0, arrayOfAddress3, arrayOfAddress1.length, arrayOfAddress2.length);
    return arrayOfAddress3;
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
        if ((!MimeBodyPart.cacheMultipart) || ((!(localObject2 instanceof Multipart)) && (!(localObject2 instanceof Message))) || ((this.content == null) && (this.contentStream == null)))
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
    return MimeBodyPart.getContentLanguage(this);
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
      return new SharedByteArrayInputStream(this.content);
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
    try
    {
      if (this.dh == null)
        this.dh = new DataHandler(new MimePartDataSource(this));
      DataHandler localDataHandler = this.dh;
      return localDataHandler;
    }
    finally
    {
    }
  }

  public String getDescription()
    throws MessagingException
  {
    return MimeBodyPart.getDescription(this);
  }

  public String getDisposition()
    throws MessagingException
  {
    return MimeBodyPart.getDisposition(this);
  }

  public String getEncoding()
    throws MessagingException
  {
    return MimeBodyPart.getEncoding(this);
  }

  public String getFileName()
    throws MessagingException
  {
    return MimeBodyPart.getFileName(this);
  }

  public Flags getFlags()
    throws MessagingException
  {
    try
    {
      Flags localFlags = (Flags)this.flags.clone();
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
    Address[] arrayOfAddress = getAddressHeader("From");
    if (arrayOfAddress == null)
      arrayOfAddress = getAddressHeader("Sender");
    return arrayOfAddress;
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

  public String getMessageID()
    throws MessagingException
  {
    return getHeader("Message-ID", null);
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

  public Date getReceivedDate()
    throws MessagingException
  {
    return null;
  }

  public Address[] getRecipients(Message.RecipientType paramRecipientType)
    throws MessagingException
  {
    if (paramRecipientType == RecipientType.NEWSGROUPS)
    {
      String str = getHeader("Newsgroups", ",");
      if (str == null)
        return null;
      return NewsAddress.parse(str);
    }
    return getAddressHeader(getHeaderName(paramRecipientType));
  }

  public Address[] getReplyTo()
    throws MessagingException
  {
    Address[] arrayOfAddress = getAddressHeader("Reply-To");
    if (arrayOfAddress == null)
      arrayOfAddress = getFrom();
    return arrayOfAddress;
  }

  public Address getSender()
    throws MessagingException
  {
    Address[] arrayOfAddress = getAddressHeader("Sender");
    if ((arrayOfAddress == null) || (arrayOfAddress.length == 0))
      return null;
    return arrayOfAddress[0];
  }

  public Date getSentDate()
    throws MessagingException
  {
    String str = getHeader("Date", null);
    if (str != null)
      try
      {
        synchronized (mailDateFormat)
        {
          Date localDate = mailDateFormat.parse(str);
          return localDate;
        }
      }
      catch (ParseException localParseException)
      {
        return null;
      }
    return null;
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

  public String getSubject()
    throws MessagingException
  {
    String str1 = getHeader("Subject", null);
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

  public boolean isMimeType(String paramString)
    throws MessagingException
  {
    return MimeBodyPart.isMimeType(this, paramString);
  }

  public boolean isSet(Flags.Flag paramFlag)
    throws MessagingException
  {
    try
    {
      boolean bool = this.flags.contains(paramFlag);
      return bool;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  protected void parse(InputStream paramInputStream)
    throws MessagingException
  {
    if ((!(paramInputStream instanceof ByteArrayInputStream)) && (!(paramInputStream instanceof BufferedInputStream)) && (!(paramInputStream instanceof SharedInputStream)))
      paramInputStream = new BufferedInputStream(paramInputStream);
    this.headers = createInternetHeaders(paramInputStream);
    if ((paramInputStream instanceof SharedInputStream))
    {
      SharedInputStream localSharedInputStream = (SharedInputStream)paramInputStream;
      this.contentStream = localSharedInputStream.newStream(localSharedInputStream.getPosition(), -1L);
    }
    while (true)
    {
      this.modified = false;
      return;
      try
      {
        this.content = ASCIIUtility.getBytes(paramInputStream);
      }
      catch (IOException localIOException)
      {
        throw new MessagingException("IOException", localIOException);
      }
    }
  }

  public void removeHeader(String paramString)
    throws MessagingException
  {
    this.headers.removeHeader(paramString);
  }

  public Message reply(boolean paramBoolean)
    throws MessagingException
  {
    MimeMessage localMimeMessage = createMimeMessage(this.session);
    String str1 = getHeader("Subject", null);
    if (str1 != null)
    {
      if (!str1.regionMatches(true, 0, "Re: ", 0, 4))
        str1 = "Re: " + str1;
      localMimeMessage.setHeader("Subject", str1);
    }
    Address[] arrayOfAddress1 = getReplyTo();
    localMimeMessage.setRecipients(Message.RecipientType.TO, arrayOfAddress1);
    Vector localVector;
    int i;
    if (paramBoolean)
    {
      localVector = new Vector();
      InternetAddress localInternetAddress = InternetAddress.getLocalAddress(this.session);
      if (localInternetAddress != null)
        localVector.addElement(localInternetAddress);
      Session localSession1 = this.session;
      String str2 = null;
      if (localSession1 != null)
        str2 = this.session.getProperty("mail.alternates");
      if (str2 != null)
        eliminateDuplicates(localVector, InternetAddress.parse(str2, false));
      Session localSession2 = this.session;
      String str3 = null;
      if (localSession2 != null)
        str3 = this.session.getProperty("mail.replyallcc");
      if ((str3 == null) || (!str3.equalsIgnoreCase("true")))
        break label436;
      i = 1;
    }
    while (true)
    {
      eliminateDuplicates(localVector, arrayOfAddress1);
      Address[] arrayOfAddress2 = eliminateDuplicates(localVector, getRecipients(Message.RecipientType.TO));
      label249: String str4;
      String str5;
      if ((arrayOfAddress2 != null) && (arrayOfAddress2.length > 0))
      {
        if (i != 0)
          localMimeMessage.addRecipients(Message.RecipientType.CC, arrayOfAddress2);
      }
      else
      {
        Address[] arrayOfAddress3 = eliminateDuplicates(localVector, getRecipients(Message.RecipientType.CC));
        if ((arrayOfAddress3 != null) && (arrayOfAddress3.length > 0))
          localMimeMessage.addRecipients(Message.RecipientType.CC, arrayOfAddress3);
        Address[] arrayOfAddress4 = getRecipients(RecipientType.NEWSGROUPS);
        if ((arrayOfAddress4 != null) && (arrayOfAddress4.length > 0))
          localMimeMessage.setRecipients(RecipientType.NEWSGROUPS, arrayOfAddress4);
        str4 = getHeader("Message-Id", null);
        if (str4 != null)
          localMimeMessage.setHeader("In-Reply-To", str4);
        str5 = getHeader("References", " ");
        if (str5 == null)
          str5 = getHeader("In-Reply-To", " ");
        if (str4 != null)
        {
          if (str5 == null)
            break label454;
          str5 = MimeUtility.unfold(str5) + " " + str4;
        }
        if (str5 != null)
          localMimeMessage.setHeader("References", MimeUtility.fold(12, str5));
      }
      try
      {
        setFlags(answeredFlag, true);
        return localMimeMessage;
        label436: i = 0;
        continue;
        localMimeMessage.addRecipients(Message.RecipientType.TO, arrayOfAddress2);
        break label249;
        label454: str5 = str4;
      }
      catch (MessagingException localMessagingException)
      {
      }
    }
    return localMimeMessage;
  }

  public void saveChanges()
    throws MessagingException
  {
    this.modified = true;
    this.saved = true;
    updateHeaders();
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
    MimeBodyPart.setContentLanguage(this, paramArrayOfString);
  }

  public void setContentMD5(String paramString)
    throws MessagingException
  {
    setHeader("Content-MD5", paramString);
  }

  public void setDataHandler(DataHandler paramDataHandler)
    throws MessagingException
  {
    try
    {
      this.dh = paramDataHandler;
      this.cachedContent = null;
      MimeBodyPart.invalidateContentHeaders(this);
      return;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public void setDescription(String paramString)
    throws MessagingException
  {
    setDescription(paramString, null);
  }

  public void setDescription(String paramString1, String paramString2)
    throws MessagingException
  {
    MimeBodyPart.setDescription(this, paramString1, paramString2);
  }

  public void setDisposition(String paramString)
    throws MessagingException
  {
    MimeBodyPart.setDisposition(this, paramString);
  }

  public void setFileName(String paramString)
    throws MessagingException
  {
    MimeBodyPart.setFileName(this, paramString);
  }

  public void setFlags(Flags paramFlags, boolean paramBoolean)
    throws MessagingException
  {
    if (paramBoolean);
    try
    {
      this.flags.add(paramFlags);
      while (true)
      {
        return;
        this.flags.remove(paramFlags);
      }
    }
    finally
    {
    }
  }

  public void setFrom()
    throws MessagingException
  {
    InternetAddress localInternetAddress = InternetAddress.getLocalAddress(this.session);
    if (localInternetAddress != null)
    {
      setFrom(localInternetAddress);
      return;
    }
    throw new MessagingException("No From address");
  }

  public void setFrom(Address paramAddress)
    throws MessagingException
  {
    if (paramAddress == null)
    {
      removeHeader("From");
      return;
    }
    setHeader("From", paramAddress.toString());
  }

  public void setHeader(String paramString1, String paramString2)
    throws MessagingException
  {
    this.headers.setHeader(paramString1, paramString2);
  }

  public void setRecipients(Message.RecipientType paramRecipientType, String paramString)
    throws MessagingException
  {
    if (paramRecipientType == RecipientType.NEWSGROUPS)
    {
      if ((paramString == null) || (paramString.length() == 0))
      {
        removeHeader("Newsgroups");
        return;
      }
      setHeader("Newsgroups", paramString);
      return;
    }
    setAddressHeader(getHeaderName(paramRecipientType), InternetAddress.parse(paramString));
  }

  public void setRecipients(Message.RecipientType paramRecipientType, Address[] paramArrayOfAddress)
    throws MessagingException
  {
    if (paramRecipientType == RecipientType.NEWSGROUPS)
    {
      if ((paramArrayOfAddress == null) || (paramArrayOfAddress.length == 0))
      {
        removeHeader("Newsgroups");
        return;
      }
      setHeader("Newsgroups", NewsAddress.toString(paramArrayOfAddress));
      return;
    }
    setAddressHeader(getHeaderName(paramRecipientType), paramArrayOfAddress);
  }

  public void setReplyTo(Address[] paramArrayOfAddress)
    throws MessagingException
  {
    setAddressHeader("Reply-To", paramArrayOfAddress);
  }

  public void setSender(Address paramAddress)
    throws MessagingException
  {
    if (paramAddress == null)
    {
      removeHeader("Sender");
      return;
    }
    setHeader("Sender", paramAddress.toString());
  }

  public void setSentDate(Date paramDate)
    throws MessagingException
  {
    if (paramDate == null)
    {
      removeHeader("Date");
      return;
    }
    synchronized (mailDateFormat)
    {
      setHeader("Date", mailDateFormat.format(paramDate));
      return;
    }
  }

  public void setSubject(String paramString)
    throws MessagingException
  {
    setSubject(paramString, null);
  }

  public void setSubject(String paramString1, String paramString2)
    throws MessagingException
  {
    if (paramString1 == null)
    {
      removeHeader("Subject");
      return;
    }
    try
    {
      setHeader("Subject", MimeUtility.fold(9, MimeUtility.encodeText(paramString1, paramString2, null)));
      return;
    }
    catch (UnsupportedEncodingException localUnsupportedEncodingException)
    {
      throw new MessagingException("Encoding error", localUnsupportedEncodingException);
    }
  }

  public void setText(String paramString)
    throws MessagingException
  {
    setText(paramString, null);
  }

  public void setText(String paramString1, String paramString2)
    throws MessagingException
  {
    MimeBodyPart.setText(this, paramString1, paramString2, "plain");
  }

  public void setText(String paramString1, String paramString2, String paramString3)
    throws MessagingException
  {
    MimeBodyPart.setText(this, paramString1, paramString2, paramString3);
  }

  protected void updateHeaders()
    throws MessagingException
  {
    MimeBodyPart.updateHeaders(this);
    setHeader("MIME-Version", "1.0");
    updateMessageID();
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
      label68: this.contentStream = null;
      return;
    }
    catch (IOException localIOException)
    {
      break label68;
    }
  }

  protected void updateMessageID()
    throws MessagingException
  {
    setHeader("Message-ID", "<" + UniqueValue.getUniqueMessageIDValue(this.session) + ">");
  }

  public void writeTo(OutputStream paramOutputStream)
    throws IOException, MessagingException
  {
    writeTo(paramOutputStream, null);
  }

  public void writeTo(OutputStream paramOutputStream, String[] paramArrayOfString)
    throws IOException, MessagingException
  {
    if (!this.saved)
      saveChanges();
    if (this.modified)
    {
      MimeBodyPart.writeTo(this, paramOutputStream, paramArrayOfString);
      return;
    }
    Enumeration localEnumeration = getNonMatchingHeaderLines(paramArrayOfString);
    LineOutputStream localLineOutputStream = new LineOutputStream(paramOutputStream);
    byte[] arrayOfByte;
    label75: int i;
    if (!localEnumeration.hasMoreElements())
    {
      localLineOutputStream.writeln();
      if (this.content != null)
        break label133;
      InputStream localInputStream = getContentStream();
      arrayOfByte = new byte[8192];
      i = localInputStream.read(arrayOfByte);
      if (i > 0)
        break label121;
      localInputStream.close();
      ((byte[])null);
    }
    while (true)
    {
      paramOutputStream.flush();
      return;
      localLineOutputStream.writeln((String)localEnumeration.nextElement());
      break;
      label121: paramOutputStream.write(arrayOfByte, 0, i);
      break label75;
      label133: paramOutputStream.write(this.content);
    }
  }

  public static class RecipientType extends Message.RecipientType
  {
    public static final RecipientType NEWSGROUPS = new RecipientType("Newsgroups");
    private static final long serialVersionUID = -5468290701714395543L;

    protected RecipientType(String paramString)
    {
      super();
    }

    protected Object readResolve()
      throws ObjectStreamException
    {
      if (this.type.equals("Newsgroups"))
        return NEWSGROUPS;
      return super.readResolve();
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     javax.mail.internet.MimeMessage
 * JD-Core Version:    0.6.2
 */