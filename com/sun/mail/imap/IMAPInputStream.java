package com.sun.mail.imap;

import com.sun.mail.iap.ByteArray;
import com.sun.mail.iap.ConnectionException;
import com.sun.mail.iap.ProtocolException;
import com.sun.mail.imap.protocol.BODY;
import com.sun.mail.imap.protocol.IMAPProtocol;
import com.sun.mail.util.FolderClosedIOException;
import com.sun.mail.util.MessageRemovedIOException;
import java.io.IOException;
import java.io.InputStream;
import javax.mail.Flags.Flag;
import javax.mail.Folder;
import javax.mail.FolderClosedException;
import javax.mail.MessagingException;

public class IMAPInputStream extends InputStream
{
  private static final int slop = 64;
  private int blksize;
  private byte[] buf;
  private int bufcount;
  private int bufpos;
  private int max;
  private IMAPMessage msg;
  private boolean peek;
  private int pos;
  private ByteArray readbuf;
  private String section;

  public IMAPInputStream(IMAPMessage paramIMAPMessage, String paramString, int paramInt, boolean paramBoolean)
  {
    this.msg = paramIMAPMessage;
    this.section = paramString;
    this.max = paramInt;
    this.peek = paramBoolean;
    this.pos = 0;
    this.blksize = paramIMAPMessage.getFetchBlockSize();
  }

  private void checkSeen()
  {
    if (this.peek);
    while (true)
    {
      return;
      try
      {
        Folder localFolder = this.msg.getFolder();
        if ((localFolder != null) && (localFolder.getMode() != 1) && (!this.msg.isSet(Flags.Flag.SEEN)))
        {
          this.msg.setFlag(Flags.Flag.SEEN, true);
          return;
        }
      }
      catch (MessagingException localMessagingException)
      {
      }
    }
  }

  private void fill()
    throws IOException
  {
    if ((this.max != -1) && (this.pos >= this.max))
    {
      if (this.pos == 0)
        checkSeen();
      this.readbuf = null;
      return;
    }
    if (this.readbuf == null)
      this.readbuf = new ByteArray(64 + this.blksize);
    ByteArray localByteArray;
    try
    {
      IMAPProtocol localIMAPProtocol;
      synchronized (this.msg.getMessageCacheLock())
      {
        try
        {
          localIMAPProtocol = this.msg.getProtocol();
          if (this.msg.isExpunged())
            throw new MessageRemovedIOException("No content for expunged message");
        }
        catch (ProtocolException localProtocolException)
        {
          forceCheckExpunged();
          throw new IOException(localProtocolException.getMessage());
        }
      }
      int i = this.msg.getSequenceNumber();
      int j = this.blksize;
      if ((this.max != -1) && (this.pos + this.blksize > this.max))
        j = this.max - this.pos;
      BODY localBODY2;
      if (this.peek)
        localBODY2 = localIMAPProtocol.peekBody(i, this.section, this.pos, j, this.readbuf);
      BODY localBODY1;
      for (Object localObject3 = localBODY2; ; localObject3 = localBODY1)
      {
        if (localObject3 != null)
        {
          localByteArray = ((BODY)localObject3).getByteArray();
          if (localByteArray != null)
            break;
        }
        forceCheckExpunged();
        throw new IOException("No content");
        localBODY1 = localIMAPProtocol.fetchBody(i, this.section, this.pos, j, this.readbuf);
      }
    }
    catch (FolderClosedException localFolderClosedException)
    {
      throw new FolderClosedIOException(localFolderClosedException.getFolder(), localFolderClosedException.getMessage());
    }
    if (this.pos == 0)
      checkSeen();
    this.buf = localByteArray.getBytes();
    this.bufpos = localByteArray.getStart();
    int k = localByteArray.getCount();
    this.bufcount = (k + this.bufpos);
    this.pos = (k + this.pos);
  }

  private void forceCheckExpunged()
    throws MessageRemovedIOException, FolderClosedIOException
  {
    try
    {
      synchronized (this.msg.getMessageCacheLock())
      {
        try
        {
          this.msg.getProtocol().noop();
          label20: if (this.msg.isExpunged())
            throw new MessageRemovedIOException();
        }
        catch (ConnectionException localConnectionException)
        {
          throw new FolderClosedIOException(this.msg.getFolder(), localConnectionException.getMessage());
        }
      }
    }
    catch (FolderClosedException localFolderClosedException)
    {
      throw new FolderClosedIOException(localFolderClosedException.getFolder(), localFolderClosedException.getMessage());
      return;
    }
    catch (ProtocolException localProtocolException)
    {
      break label20;
    }
  }

  public int available()
    throws IOException
  {
    try
    {
      int i = this.bufcount;
      int j = this.bufpos;
      int k = i - j;
      return k;
    }
    finally
    {
      localObject = finally;
      throw localObject;
    }
  }

  public int read()
    throws IOException
  {
    try
    {
      if (this.bufpos >= this.bufcount)
      {
        fill();
        int m = this.bufpos;
        int n = this.bufcount;
        if (m < n);
      }
      int j;
      for (int k = -1; ; k = j & 0xFF)
      {
        return k;
        byte[] arrayOfByte = this.buf;
        int i = this.bufpos;
        this.bufpos = (i + 1);
        j = arrayOfByte[i];
      }
    }
    finally
    {
    }
  }

  public int read(byte[] paramArrayOfByte)
    throws IOException
  {
    return read(paramArrayOfByte, 0, paramArrayOfByte.length);
  }

  public int read(byte[] paramArrayOfByte, int paramInt1, int paramInt2)
    throws IOException
  {
    while (true)
    {
      try
      {
        int i = this.bufcount - this.bufpos;
        if (i <= 0)
        {
          fill();
          int j = this.bufcount;
          int k = this.bufpos;
          i = j - k;
          if (i <= 0)
          {
            m = -1;
            return m;
          }
        }
        if (i < paramInt2)
        {
          m = i;
          System.arraycopy(this.buf, this.bufpos, paramArrayOfByte, paramInt1, m);
          this.bufpos = (m + this.bufpos);
          continue;
        }
      }
      finally
      {
      }
      int m = paramInt2;
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.IMAPInputStream
 * JD-Core Version:    0.6.2
 */