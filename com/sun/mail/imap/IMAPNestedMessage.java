package com.sun.mail.imap;

import com.sun.mail.iap.ProtocolException;
import com.sun.mail.imap.protocol.BODYSTRUCTURE;
import com.sun.mail.imap.protocol.ENVELOPE;
import com.sun.mail.imap.protocol.IMAPProtocol;
import javax.mail.Flags;
import javax.mail.FolderClosedException;
import javax.mail.MessageRemovedException;
import javax.mail.MessagingException;
import javax.mail.MethodNotSupportedException;

public class IMAPNestedMessage extends IMAPMessage
{
  private IMAPMessage msg;

  IMAPNestedMessage(IMAPMessage paramIMAPMessage, BODYSTRUCTURE paramBODYSTRUCTURE, ENVELOPE paramENVELOPE, String paramString)
  {
    super(paramIMAPMessage._getSession());
    this.msg = paramIMAPMessage;
    this.bs = paramBODYSTRUCTURE;
    this.envelope = paramENVELOPE;
    this.sectionId = paramString;
  }

  protected void checkExpunged()
    throws MessageRemovedException
  {
    this.msg.checkExpunged();
  }

  protected int getFetchBlockSize()
  {
    return this.msg.getFetchBlockSize();
  }

  protected Object getMessageCacheLock()
  {
    return this.msg.getMessageCacheLock();
  }

  protected IMAPProtocol getProtocol()
    throws ProtocolException, FolderClosedException
  {
    return this.msg.getProtocol();
  }

  protected int getSequenceNumber()
  {
    return this.msg.getSequenceNumber();
  }

  public int getSize()
    throws MessagingException
  {
    return this.bs.size;
  }

  public boolean isExpunged()
  {
    return this.msg.isExpunged();
  }

  protected boolean isREV1()
    throws FolderClosedException
  {
    return this.msg.isREV1();
  }

  public void setFlags(Flags paramFlags, boolean paramBoolean)
    throws MessagingException
  {
    try
    {
      throw new MethodNotSupportedException("Cannot set flags on this nested message");
    }
    finally
    {
    }
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.IMAPNestedMessage
 * JD-Core Version:    0.6.2
 */