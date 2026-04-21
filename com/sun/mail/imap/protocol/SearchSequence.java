package com.sun.mail.imap.protocol;

import com.sun.mail.iap.Argument;
import java.io.IOException;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import javax.mail.Address;
import javax.mail.Flags;
import javax.mail.Flags.Flag;
import javax.mail.Message.RecipientType;
import javax.mail.search.AddressTerm;
import javax.mail.search.AndTerm;
import javax.mail.search.BodyTerm;
import javax.mail.search.DateTerm;
import javax.mail.search.FlagTerm;
import javax.mail.search.FromStringTerm;
import javax.mail.search.FromTerm;
import javax.mail.search.HeaderTerm;
import javax.mail.search.MessageIDTerm;
import javax.mail.search.NotTerm;
import javax.mail.search.OrTerm;
import javax.mail.search.ReceivedDateTerm;
import javax.mail.search.RecipientStringTerm;
import javax.mail.search.RecipientTerm;
import javax.mail.search.SearchException;
import javax.mail.search.SearchTerm;
import javax.mail.search.SentDateTerm;
import javax.mail.search.SizeTerm;
import javax.mail.search.StringTerm;
import javax.mail.search.SubjectTerm;

class SearchSequence
{
  private static Calendar cal = new GregorianCalendar();
  private static String[] monthTable = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

  private static Argument and(AndTerm paramAndTerm, String paramString)
    throws SearchException, IOException
  {
    SearchTerm[] arrayOfSearchTerm = paramAndTerm.getTerms();
    Argument localArgument = generateSequence(arrayOfSearchTerm[0], paramString);
    for (int i = 1; ; i++)
    {
      if (i >= arrayOfSearchTerm.length)
        return localArgument;
      localArgument.append(generateSequence(arrayOfSearchTerm[i], paramString));
    }
  }

  private static Argument body(BodyTerm paramBodyTerm, String paramString)
    throws SearchException, IOException
  {
    Argument localArgument = new Argument();
    localArgument.writeAtom("BODY");
    localArgument.writeString(paramBodyTerm.getPattern(), paramString);
    return localArgument;
  }

  private static Argument flag(FlagTerm paramFlagTerm)
    throws SearchException
  {
    boolean bool = paramFlagTerm.getTestSet();
    Argument localArgument = new Argument();
    Flags localFlags = paramFlagTerm.getFlags();
    Flags.Flag[] arrayOfFlag = localFlags.getSystemFlags();
    String[] arrayOfString = localFlags.getUserFlags();
    if ((arrayOfFlag.length == 0) && (arrayOfString.length == 0))
      throw new SearchException("Invalid FlagTerm");
    int i = 0;
    int j;
    if (i >= arrayOfFlag.length)
    {
      j = 0;
      if (j >= arrayOfString.length)
        return localArgument;
    }
    else
    {
      String str6;
      if (arrayOfFlag[i] == Flags.Flag.DELETED)
        if (bool)
        {
          str6 = "DELETED";
          label95: localArgument.writeAtom(str6);
        }
      do
      {
        i++;
        break;
        str6 = "UNDELETED";
        break label95;
        if (arrayOfFlag[i] == Flags.Flag.ANSWERED)
        {
          if (bool);
          for (String str5 = "ANSWERED"; ; str5 = "UNANSWERED")
          {
            localArgument.writeAtom(str5);
            break;
          }
        }
        if (arrayOfFlag[i] == Flags.Flag.DRAFT)
        {
          if (bool);
          for (String str4 = "DRAFT"; ; str4 = "UNDRAFT")
          {
            localArgument.writeAtom(str4);
            break;
          }
        }
        if (arrayOfFlag[i] == Flags.Flag.FLAGGED)
        {
          if (bool);
          for (String str3 = "FLAGGED"; ; str3 = "UNFLAGGED")
          {
            localArgument.writeAtom(str3);
            break;
          }
        }
        if (arrayOfFlag[i] == Flags.Flag.RECENT)
        {
          if (bool);
          for (String str2 = "RECENT"; ; str2 = "OLD")
          {
            localArgument.writeAtom(str2);
            break;
          }
        }
      }
      while (arrayOfFlag[i] != Flags.Flag.SEEN);
      if (bool);
      for (String str1 = "SEEN"; ; str1 = "UNSEEN")
      {
        localArgument.writeAtom(str1);
        break;
      }
    }
    if (bool);
    for (String str7 = "KEYWORD"; ; str7 = "UNKEYWORD")
    {
      localArgument.writeAtom(str7);
      localArgument.writeAtom(arrayOfString[j]);
      j++;
      break;
    }
  }

  private static Argument from(String paramString1, String paramString2)
    throws SearchException, IOException
  {
    Argument localArgument = new Argument();
    localArgument.writeAtom("FROM");
    localArgument.writeString(paramString1, paramString2);
    return localArgument;
  }

  static Argument generateSequence(SearchTerm paramSearchTerm, String paramString)
    throws SearchException, IOException
  {
    if ((paramSearchTerm instanceof AndTerm))
      return and((AndTerm)paramSearchTerm, paramString);
    if ((paramSearchTerm instanceof OrTerm))
      return or((OrTerm)paramSearchTerm, paramString);
    if ((paramSearchTerm instanceof NotTerm))
      return not((NotTerm)paramSearchTerm, paramString);
    if ((paramSearchTerm instanceof HeaderTerm))
      return header((HeaderTerm)paramSearchTerm, paramString);
    if ((paramSearchTerm instanceof FlagTerm))
      return flag((FlagTerm)paramSearchTerm);
    if ((paramSearchTerm instanceof FromTerm))
      return from(((FromTerm)paramSearchTerm).getAddress().toString(), paramString);
    if ((paramSearchTerm instanceof FromStringTerm))
      return from(((FromStringTerm)paramSearchTerm).getPattern(), paramString);
    if ((paramSearchTerm instanceof RecipientTerm))
    {
      RecipientTerm localRecipientTerm = (RecipientTerm)paramSearchTerm;
      return recipient(localRecipientTerm.getRecipientType(), localRecipientTerm.getAddress().toString(), paramString);
    }
    if ((paramSearchTerm instanceof RecipientStringTerm))
    {
      RecipientStringTerm localRecipientStringTerm = (RecipientStringTerm)paramSearchTerm;
      return recipient(localRecipientStringTerm.getRecipientType(), localRecipientStringTerm.getPattern(), paramString);
    }
    if ((paramSearchTerm instanceof SubjectTerm))
      return subject((SubjectTerm)paramSearchTerm, paramString);
    if ((paramSearchTerm instanceof BodyTerm))
      return body((BodyTerm)paramSearchTerm, paramString);
    if ((paramSearchTerm instanceof SizeTerm))
      return size((SizeTerm)paramSearchTerm);
    if ((paramSearchTerm instanceof SentDateTerm))
      return sentdate((SentDateTerm)paramSearchTerm);
    if ((paramSearchTerm instanceof ReceivedDateTerm))
      return receiveddate((ReceivedDateTerm)paramSearchTerm);
    if ((paramSearchTerm instanceof MessageIDTerm))
      return messageid((MessageIDTerm)paramSearchTerm, paramString);
    throw new SearchException("Search too complex");
  }

  private static Argument header(HeaderTerm paramHeaderTerm, String paramString)
    throws SearchException, IOException
  {
    Argument localArgument = new Argument();
    localArgument.writeAtom("HEADER");
    localArgument.writeString(paramHeaderTerm.getHeaderName());
    localArgument.writeString(paramHeaderTerm.getPattern(), paramString);
    return localArgument;
  }

  private static boolean isAscii(String paramString)
  {
    int i = paramString.length();
    for (int j = 0; ; j++)
    {
      if (j >= i)
        return true;
      if (paramString.charAt(j) > '')
        return false;
    }
  }

  static boolean isAscii(SearchTerm paramSearchTerm)
  {
    SearchTerm[] arrayOfSearchTerm;
    int i;
    if (((paramSearchTerm instanceof AndTerm)) || ((paramSearchTerm instanceof OrTerm)))
      if ((paramSearchTerm instanceof AndTerm))
      {
        arrayOfSearchTerm = ((AndTerm)paramSearchTerm).getTerms();
        i = 0;
        label31: if (i < arrayOfSearchTerm.length)
          break label50;
      }
    label50: 
    do
    {
      return true;
      arrayOfSearchTerm = ((OrTerm)paramSearchTerm).getTerms();
      break;
      if (!isAscii(arrayOfSearchTerm[i]))
        return false;
      i++;
      break label31;
      if ((paramSearchTerm instanceof NotTerm))
        return isAscii(((NotTerm)paramSearchTerm).getTerm());
      if ((paramSearchTerm instanceof StringTerm))
        return isAscii(((StringTerm)paramSearchTerm).getPattern());
    }
    while (!(paramSearchTerm instanceof AddressTerm));
    return isAscii(((AddressTerm)paramSearchTerm).getAddress().toString());
  }

  private static Argument messageid(MessageIDTerm paramMessageIDTerm, String paramString)
    throws SearchException, IOException
  {
    Argument localArgument = new Argument();
    localArgument.writeAtom("HEADER");
    localArgument.writeString("Message-ID");
    localArgument.writeString(paramMessageIDTerm.getPattern(), paramString);
    return localArgument;
  }

  private static Argument not(NotTerm paramNotTerm, String paramString)
    throws SearchException, IOException
  {
    Argument localArgument = new Argument();
    localArgument.writeAtom("NOT");
    SearchTerm localSearchTerm = paramNotTerm.getTerm();
    if (((localSearchTerm instanceof AndTerm)) || ((localSearchTerm instanceof FlagTerm)))
    {
      localArgument.writeArgument(generateSequence(localSearchTerm, paramString));
      return localArgument;
    }
    localArgument.append(generateSequence(localSearchTerm, paramString));
    return localArgument;
  }

  private static Argument or(OrTerm paramOrTerm, String paramString)
    throws SearchException, IOException
  {
    SearchTerm[] arrayOfSearchTerm = paramOrTerm.getTerms();
    Object localObject;
    int i;
    Argument localArgument;
    if (arrayOfSearchTerm.length > 2)
    {
      localObject = arrayOfSearchTerm[0];
      i = 1;
      if (i >= arrayOfSearchTerm.length)
        arrayOfSearchTerm = ((OrTerm)localObject).getTerms();
    }
    else
    {
      localArgument = new Argument();
      if (arrayOfSearchTerm.length > 1)
        localArgument.writeAtom("OR");
      if ((!(arrayOfSearchTerm[0] instanceof AndTerm)) && (!(arrayOfSearchTerm[0] instanceof FlagTerm)))
        break label147;
      localArgument.writeArgument(generateSequence(arrayOfSearchTerm[0], paramString));
    }
    while (true)
    {
      if (arrayOfSearchTerm.length > 1)
      {
        if ((!(arrayOfSearchTerm[1] instanceof AndTerm)) && (!(arrayOfSearchTerm[1] instanceof FlagTerm)))
          break label161;
        localArgument.writeArgument(generateSequence(arrayOfSearchTerm[1], paramString));
      }
      return localArgument;
      OrTerm localOrTerm = new OrTerm((SearchTerm)localObject, arrayOfSearchTerm[i]);
      i++;
      localObject = localOrTerm;
      break;
      label147: localArgument.append(generateSequence(arrayOfSearchTerm[0], paramString));
    }
    label161: localArgument.append(generateSequence(arrayOfSearchTerm[1], paramString));
    return localArgument;
  }

  private static Argument receiveddate(DateTerm paramDateTerm)
    throws SearchException
  {
    Argument localArgument = new Argument();
    String str = toIMAPDate(paramDateTerm.getDate());
    switch (paramDateTerm.getComparison())
    {
    default:
      throw new SearchException("Cannot handle Date Comparison");
    case 5:
      localArgument.writeAtom("SINCE " + str);
      return localArgument;
    case 3:
      localArgument.writeAtom("ON " + str);
      return localArgument;
    case 2:
      localArgument.writeAtom("BEFORE " + str);
      return localArgument;
    case 6:
      localArgument.writeAtom("OR SINCE " + str + " ON " + str);
      return localArgument;
    case 1:
      localArgument.writeAtom("OR BEFORE " + str + " ON " + str);
      return localArgument;
    case 4:
    }
    localArgument.writeAtom("NOT ON " + str);
    return localArgument;
  }

  private static Argument recipient(Message.RecipientType paramRecipientType, String paramString1, String paramString2)
    throws SearchException, IOException
  {
    Argument localArgument = new Argument();
    if (paramRecipientType == Message.RecipientType.TO)
      localArgument.writeAtom("TO");
    while (true)
    {
      localArgument.writeString(paramString1, paramString2);
      return localArgument;
      if (paramRecipientType == Message.RecipientType.CC)
      {
        localArgument.writeAtom("CC");
      }
      else
      {
        if (paramRecipientType != Message.RecipientType.BCC)
          break;
        localArgument.writeAtom("BCC");
      }
    }
    throw new SearchException("Illegal Recipient type");
  }

  private static Argument sentdate(DateTerm paramDateTerm)
    throws SearchException
  {
    Argument localArgument = new Argument();
    String str = toIMAPDate(paramDateTerm.getDate());
    switch (paramDateTerm.getComparison())
    {
    default:
      throw new SearchException("Cannot handle Date Comparison");
    case 5:
      localArgument.writeAtom("SENTSINCE " + str);
      return localArgument;
    case 3:
      localArgument.writeAtom("SENTON " + str);
      return localArgument;
    case 2:
      localArgument.writeAtom("SENTBEFORE " + str);
      return localArgument;
    case 6:
      localArgument.writeAtom("OR SENTSINCE " + str + " SENTON " + str);
      return localArgument;
    case 1:
      localArgument.writeAtom("OR SENTBEFORE " + str + " SENTON " + str);
      return localArgument;
    case 4:
    }
    localArgument.writeAtom("NOT SENTON " + str);
    return localArgument;
  }

  private static Argument size(SizeTerm paramSizeTerm)
    throws SearchException
  {
    Argument localArgument = new Argument();
    switch (paramSizeTerm.getComparison())
    {
    case 3:
    case 4:
    default:
      throw new SearchException("Cannot handle Comparison");
    case 5:
      localArgument.writeAtom("LARGER");
    case 2:
    }
    while (true)
    {
      localArgument.writeNumber(paramSizeTerm.getNumber());
      return localArgument;
      localArgument.writeAtom("SMALLER");
    }
  }

  private static Argument subject(SubjectTerm paramSubjectTerm, String paramString)
    throws SearchException, IOException
  {
    Argument localArgument = new Argument();
    localArgument.writeAtom("SUBJECT");
    localArgument.writeString(paramSubjectTerm.getPattern(), paramString);
    return localArgument;
  }

  private static String toIMAPDate(Date paramDate)
  {
    StringBuffer localStringBuffer = new StringBuffer();
    cal.setTime(paramDate);
    localStringBuffer.append(cal.get(5)).append("-");
    localStringBuffer.append(monthTable[cal.get(2)]).append('-');
    localStringBuffer.append(cal.get(1));
    return localStringBuffer.toString();
  }
}

/* Location:           D:\jd-gui-0.3.5.windows对jar文件反编译\classes_dex2jar.jar
 * Qualified Name:     com.sun.mail.imap.protocol.SearchSequence
 * JD-Core Version:    0.6.2
 */