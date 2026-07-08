import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [
      appointments,
      emails,
      calls,
      knowledgeDocs,
      integrations,
      chatMessages,
      business,
    ] = await Promise.all([
      db.appointment.findMany({ orderBy: { date: "desc" } }),
      db.emailRecord.findMany({ orderBy: { createdAt: "desc" } }),
      db.callLog.findMany({ orderBy: { createdAt: "desc" } }),
      db.knowledgeDoc.findMany(),
      db.integration.findMany(),
      db.chatMessage.findMany(),
      db.business.findFirst(),
    ]);

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const apptsLast14 = appointments.filter(
      (a) => new Date(a.date) >= fourteenDaysAgo
    );

    // Appointments per day (last 14 days)
    const appointmentsByDay: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      appointmentsByDay[key] = 0;
    }
    apptsLast14.forEach((a) => {
      const key = new Date(a.date).toISOString().split("T")[0];
      if (key in appointmentsByDay) appointmentsByDay[key]++;
    });

    // Top services
    const serviceCounts: Record<string, number> = {};
    appointments.forEach((a) => {
      serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
    });
    const topServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // Peak hours
    const hourCounts: Record<number, number> = {};
    appointments.forEach((a) => {
      const h = new Date(a.date).getHours();
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });
    const peakHours = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        label: `${hour}:00`,
        count,
      }));

    // Day of week
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];
    appointments.forEach((a) => {
      dayCounts[new Date(a.date).getDay()]++;
    });
    const appointmentsByDayOfWeek = dayNames.map((name, i) => ({
      name,
      count: dayCounts[i],
    }));

    const completedAppts = appointments.filter(
      (a) => a.duration
    );
    const avgDuration =
      completedAppts.length > 0
        ? Math.round(
            completedAppts.reduce((sum, a) => sum + a.duration, 0) /
              completedAppts.length
          )
        : 0;

    const callsWithDuration = calls.filter((c) => c.duration && c.duration > 0);
    const avgCallDuration =
      callsWithDuration.length > 0
        ? Math.round(
            callsWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) /
              callsWithDuration.length
          )
        : 0;

    return NextResponse.json({
      summary: {
        totalAppointments: appointments.length,
        totalEmails: emails.length,
        totalCalls: calls.length,
        totalKnowledgeDocs: knowledgeDocs.length,
        activeKnowledgeDocs: knowledgeDocs.filter((d) => d.isActive).length,
        totalIntegrations: integrations.length,
        connectedIntegrations: integrations.filter((i) => i.status === "connected").length,
        totalChats: chatMessages.length,
      },
      appointmentStatus: {
        scheduled: appointments.filter((a) => a.status === "scheduled").length,
        confirmed: appointments.filter((a) => a.status === "confirmed").length,
        completed: appointments.filter((a) => a.status === "completed").length,
        cancelled: appointments.filter((a) => a.status === "cancelled").length,
        noShow: appointments.filter((a) => a.status === "no-show").length,
      },
      appointmentsByDay,
      topServices,
      peakHours,
      appointmentsByDayOfWeek,
      avgDuration,
      emailStats: {
        total: emails.length,
        inbound: emails.filter((e) => e.direction === "inbound").length,
        outbound: emails.filter((e) => e.direction === "outbound").length,
      },
      callStats: {
        total: calls.length,
        inbound: calls.filter((c) => c.direction === "inbound").length,
        outbound: calls.filter((c) => c.direction === "outbound").length,
        missed: calls.filter((c) => c.status === "missed").length,
        avgDuration: avgCallDuration,
      },
      knowledgeStats: {
        total: knowledgeDocs.length,
        active: knowledgeDocs.filter((d) => d.isActive).length,
        totalSize: knowledgeDocs.reduce((sum, d) => sum + d.fileSize, 0),
      },
      chatStats: {
        total: chatMessages.length,
        userMessages: chatMessages.filter((m) => m.role === "user").length,
        assistantMessages: chatMessages.filter((m) => m.role === "assistant").length,
      },
      business: business
        ? { name: business.name, type: business.type, createdAt: business.createdAt }
        : null,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}